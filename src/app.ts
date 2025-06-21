// This file is the main entry point for my custom framework wrapper around discord.js
import "reflect-metadata";
import "./set.js";

import Discord, { ChannelType, TextBasedChannel } from "discord.js";
import fs from "fs";

import { ArgumentParser } from "./argumentParser.js";
import { CollectionManager } from "./collectionManager.js";
import { BotCommand, BotCommandArgument, CommandEvent, MultiCommand, Sendable } from "./command.js";
import { ConfigManager } from "./configManager.js";
import Database from "./database.js";
import { DynamicMessageRef } from "./dynamicMessage.js";
import { defaultFrameworkOpts, EmbedOptions, FrameworkClientOptions } from "./interfaces.js";
import Logger from "./logger.js";
import { PermissionManager } from "./permissions.js";
import { SlashCommand, SlashCommandAutocompleteEvent, SlashCommandEvent, SlashCommandParent } from "./slashCommand.js";
import { SlashCommandArgumentParser } from "./slashCommandArgumentParser.js";
import { UtilityManager } from "./util/utilManager.js";

export type MessageChannel = Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel | Discord.ThreadChannel | Discord.PartialDMChannel;
class FrameworkClient {
	public client: Discord.Client;
	public botCommands: BotCommand[] = [];
	public slashCommands: SlashCommandParent[] = [];
	public database: Database;
	public permissions: PermissionManager;
	public log: Logger;
	public dynamicMessages: CollectionManager<DynamicMessageRef<unknown>>;
	// These "ready" promises are awaitables to allow methods to wait for something to be ready to be used
	public dbReady: Promise<void>;
	public botReady: Promise<void>;
	public utils: UtilityManager;
	public config: ConfigManager;
	public options: FrameworkClientOptions;
	public overrides: string[] = [];

	private botReadyResolve: () => void;
	// User app is a Class instance or object that the user gives the framework, and is passed to each command invocation
	private userApp: Object;
	constructor(opts: FrameworkClientOptions) {
		this.options = this.loadOpts(opts);
		this.utils = new UtilityManager(this);
		this.log = new Logger(this.options.loggerOpts);
		this.database = new Database(opts.databaseOpts, msg => this.log.info(msg));
		this.permissions = new PermissionManager(this);
		this.config = new ConfigManager(this);
		ArgumentParser.instance.framework = this;
		// Setup the awaitable promises
		this.botReady = new Promise(resolve => (this.botReadyResolve = resolve));
	}
	private loadOpts(opts: FrameworkClientOptions): FrameworkClientOptions {
		Object.keys(defaultFrameworkOpts).forEach(key => {
			if (!opts.hasOwnProperty(key)) {
				opts[key] = defaultFrameworkOpts[key];
			}
		});
		return opts;
	}
	// Initializes the framework
	public async init(application?: Object) {
		this.log.info("Starting bot");
		this.userApp = application;
		this.client = new Discord.Client(this.options.clientOptions);
		this.client.login(this.options.token);
		this.initEventHandlers();
		await this.database.init();
		await this.config.init();
		await this.permissions.init();
		await this.botReady;
		await this.loadBotCommands(this.options.commandsPath);
		await this.finalizeSlashCommands();
		await this.config.addKey("prefix", this.options.defaultPrefix);
		this.dynamicMessages = await this.database.collection("dynamic-messages", false, "messageId");
	}
	// Sets up all the event handlers the framework listens to
	private initEventHandlers() {
		this.client.on("ready", () => {
			this.log.setClient(this.client);
			this.log.info(`Client started up. Logged in as ${this.client.user.username} (${this.client.user.id})`);
			this.botReadyResolve();
		});
		this.client.on("message", msg => {
			// Using old "message" rather than "messageCreate" because djs dumb
			if (msg.author.bot) return;
			msg.initTime = Date.now(); // aaaa this is bad but I like the data
			this.handleMessage(msg);
		});
		this.client.on(`error`, this.log.cb.error);
		// this.client.on("warn", this.log.cb.warn);
		this.client.on("guildCreate", async guild => {
			this.log.info(`Bot joined new guild ${guild.name} (${guild.id}) with ${guild.memberCount} members. Creating new config entry.`);
			await this.config.onGuildJoin(guild.id);
		});
		this.client.on("guildDelete", async guild => {
			this.log.info(`Bot left or was removed from guild ${guild.name} (${guild.id}). Removing config entry.`);
			await this.config.onGuildLeave(guild.id);
		});
		this.client.on("guildMemberAdd", member => {
			this.permissions.clearUserTracks(member.id);
		});
		this.client.on("interactionCreate", itr => {
			if (itr.isChatInputCommand()) {
				this.handleSlashCommand(itr);
			} else if (itr.isAutocomplete()) {
				this.handleAutocomplete(itr);
			}
		});
	}
	// Gets the files in whatever path points to, and iterates over all the js files to be loaded as commands
	// Mask enforces only specific files are loaded (useful for defaults)
	public async loadBotCommands(path: string, mask?: string[]) {
		const newCommands = await this.fetchBotCommands(path);
		const masked = newCommands.filter(command => {
			if (!mask) return true;
			return mask.some(maskName => command.name == maskName);
		});
		this.botCommands = this.botCommands.concat(masked);
		const perms: Set<string> = new Set();
		function assignPerms(command: BotCommand) {
			command.permissions.push("command" + command.category + "." + command.name);
			command.permissions.forEach(perm => perms.add(perm));
			if (isMultiCommand(command)) {
				command.subCommands.forEach(sc => {
					if (sc.name != command.name) assignPerms(sc);
				});
			}
		}
		this.botCommands.forEach(assignPerms);
		this.permissions.loadPerms([...perms]);
	}
	private async fetchBotCommands(path: string, catTag: string = ""): Promise<BotCommand[]> {
		const files = fs.readdirSync(path);
		this.log.info(`Found files in ${path.substring(path.lastIndexOf("/", path.length - 2))} folder: ${files.join(", ")}`);
		const commandsImports: Array<Promise<BotCommand | BotCommand[]>> = files.map(async file => {
			if (fs.statSync(path + file).isDirectory()) {
				const newTag = catTag + "." + file;
				const subcommands = await this.fetchBotCommands(path + file + "/", newTag);
				const base = subcommands.find(subcommand => subcommand.name == file) as MultiCommand;

				if (base) {
					base.subCommands = subcommands;
					subcommands.forEach(sc => {
						if (sc != base) sc.parent = base;
					});
					return base;
				} else {
					return subcommands;
				}
			}
			if (!file.endsWith(".js")) {
				if (!file.endsWith(".d.ts")) this.log.warn(`Command file ${path + file} does not end with ".js" thus will be omitted for import`);
				return null;
			}
			const imported: { default: new () => BotCommand } = await import("file://" + path + file);
			if (typeof imported.default != "function") {
				this.log.error(`Unable to import command from ${path + file}, default export is not a class`);
				return null;
			}

			const command = new imported.default();
			// Slash commands don't register as a typical command
			if (command instanceof SlashCommandParent) {
				this.loadSlashCommand(command, path + file);
				return null;
			}

			command.category = catTag;
			return command;
		});
		const imported = await Promise.all(commandsImports);
		return imported.filter(obj => obj != null).flat() as BotCommand[];
	}
	private loadSlashCommand(command: SlashCommandParent, filepath: string) {
		this.log.info(`Loading slash command ${command.name}`);
		const sourceFilePath = filepath
			.split("")
			.reverse()
			.join("")
			.replaceAll("\\", "/")
			.replace("/tsid/", "/crs/")
			.split("")
			.reverse()
			.join("")
			.replace(".js", ".ts");
		this.log.info(`Registering slash command from source file ${sourceFilePath}`);
		SlashCommandArgumentParser.registerCommandFromSourceFile(command, sourceFilePath);

		this.slashCommands.push(command);
	}

	private async finalizeSlashCommands() {
		// Assign subcommands to their parent commands
		this.slashCommands.forEach(command => {
			const sc = command.getSubCommands();
			sc.forEach(subCommandCtor => {
				const subCommand = this.slashCommands.find(c => c.constructor == subCommandCtor);
				if (!subCommand) {
					this.log.error(`Subcommand ${subCommandCtor.name} for command ${command.name} not found`);
					return;
				} else {
					if (!(subCommand instanceof SlashCommand)) throw new Error(`Subcommand ${subCommandCtor.name} is not an instance of SlashCommand`);
					subCommand._isSubcommand = true;
					command._subCommands.push(subCommand);
					subCommand._parent = command;
				}
			});
		});

		const slashCommands = this.slashCommands
			.map(command => {
				return SlashCommandArgumentParser.buildSlashCommand(command, this.slashCommands);
			})
			.filter(sc => sc != null);
		this.log.info(`Registering ${slashCommands.length} slash commands`);

		if (this.options.slashCommandDevServer) {
			const devGuild = await this.client.guilds.fetch(this.options.slashCommandDevServer);
			await devGuild.commands.set(slashCommands);
			this.log.info(`Registered slash commands in ${devGuild.name} (${devGuild.id})`);
		} else {
			this.log.info(`No dev guild set, skipping slash command set`);
		}
	}

	// Handles the bot being mentioned, we want to tell the user what the prefix is in case they don't know it
	private async handleMention(message: Discord.Message) {
		if (!this.options.dmPrefixOnPing) return;
		try {
			if (message.guild) {
				message.member.send({
					embeds: [
						this.makeEmbed({
							desc: `The prefix for ${message.guild.name} is \`${await this.config.getKey(message.guild.id, "prefix")}\``
						})
					]
				});
			} else {
				message.member.send({
					embeds: [
						this.makeEmbed({
							desc: `The prefix for ${this.options.name} is \`${this.options.defaultPrefix}\``
						})
					]
				});
			}
		} catch (e) {
			this.log.error(e);
		}
	}
	private async handleSlashCommand(interaction: Discord.CommandInteraction) {
		let command = this.slashCommands.find(command => command.name == interaction.commandName && !command._isSubcommand);
		if (command.getSubCommands().length > 0) {
			// Resolve the subcommand
			const subCommand = command._subCommands.find(subCommand => subCommand.name == interaction.options.data[0].name);
			if (!subCommand) {
				this.log.error(`Subcommand ${interaction.options.data[0].name} for command ${command.name} not found`);
				return;
			}

			command = subCommand;
		}

		if (!command) {
			this.log.error(`Slash command ${interaction.commandName} was not found`);
			return;
		}
		try {
			if (!(command instanceof SlashCommand)) throw new Error(`Command ${command.name} is not an instance of SlashCommand`);
			const interactionEvent = new SlashCommandEvent(this, interaction, this.userApp, command);
			const args = SlashCommandArgumentParser.layoutArguments(command, interaction.options.data);
			const rArgs = [interactionEvent, ...args.slice(1)];
			const reply = await command.run.apply(command, rArgs);
			if (reply) {
				await interaction.reply(toDiscordSendable(reply));
			}
		} catch (e) {
			this.log.error(`Error running slash command ${command.name}`);
			this.log.error(e);
		}
	}
	private async handleAutocomplete(interaction: Discord.AutocompleteInteraction) {
		let command = this.slashCommands.find(command => command.name == interaction.commandName);
		if (command.getSubCommands().length > 0) {
			// Resolve the subcommand
			const subCommand = command._subCommands.find(subCommand => subCommand.name == interaction.options.data[0].name);
			if (!subCommand) {
				this.log.error(`Subcommand ${interaction.options.data[0].name} for command ${command.name} not found`);
				return;
			}

			command = subCommand;
		}

		if (!command) {
			this.log.error(`Slash command ${interaction.commandName} was not found`);
			return;
		}

		if (!(command instanceof SlashCommand)) throw new Error(`Command ${command.name} is not an instance of SlashCommand`);

		const event = new SlashCommandAutocompleteEvent(this, interaction, this.userApp, command);
		command.handleAutocomplete(event);
	}
	// Primary message handler that executes commands
	private async handleMessage(message: Discord.Message) {
		const ments = message.mentions.members;
		if (ments && ments.first() && ments.first().user.id == this.client.user.id) {
			await this.handleMention(message);
		}
		// Gets the command that was executed, requires that prefix is one char long. Command names are case insensitive
		const commandStr = message.content.substring(1).split(" ")[0].toLowerCase();
		// Resolve the prefix for the guild (need to check command was run with correct prefix)
		const prefix = message.guild ? await this.config.getKey(message.guild.id, "prefix") : this.options.defaultPrefix;
		if (!message.content.startsWith(prefix)) {
			return;
		}
		this.handleCommand(commandStr, message);
	}
	private async handleCommand(commandString: string, message: Discord.Message, commandsList = this.botCommands, event?: CommandEvent, cmdDpth = 1) {
		// console.log(`CMD STR: ${commandString}`);
		const command: BotCommand = commandsList.find(botCommand => {
			const nameList = Array.isArray(botCommand.altNames) ? botCommand.altNames.concat([botCommand.name]) : [botCommand.name];
			return nameList.includes(commandString);
		});
		if (!command) {
			return;
		}
		// Make sure command can be run in a DM channel if it is in a DM
		if (!command.allowDM && message.channel.type == ChannelType.DM) {
			if (!this.options.dmErrorSilently) {
				message.channel.send(this.error(`This command does not work in DMs, please run it in a server instead`));
			}
			return;
		}
		if (command) {
			this.logCommand(message);
			const hasPerm = await this.checkUserPerm(command, message);
			if (!hasPerm) return;
			// console.log(" - " + command.name + ": " + isMultiCommand(command));
			if (isMultiCommand(command)) {
				const subCommandStr = message.content.split(" ")[cmdDpth]?.toLowerCase();
				// console.log(` - Sub cmd str: ${subCommandStr} (${command.name})`);
				if (!subCommandStr || subCommandStr == command.name || command.altNames?.includes(subCommandStr)) return await this.execCommand(command, message);
				// console.log(` - ${command.subCommands.map(c => c.name).join(", ")}`);
				let envt = event ? event : new CommandEvent(this, message, this.userApp, command);
				// envt.command = command;
				if (command.check) {
					const subCheck = await command.check(envt);
					if (!subCheck.pass) {
						return await sendMessage(message.channel, subCheck.failMessage);
					}
					envt = subCheck.event;
				}
				await this.handleCommand(subCommandStr, message, command.subCommands, envt, cmdDpth + 1);
			} else {
				if (event) event.updateCommand(command); // Event may have started as a sub-command, so make sure this is correct
				await this.execCommand(command, message, event);
			}
		}
	}
	private async execCommand(command: BotCommand, message: Discord.Message, event?: CommandEvent) {
		try {
			// Execute the command and if there is a return output it
			const envt = event ? event : new CommandEvent(this, message, this.userApp, command);
			// @ts-ignore
			const args: Array<CommandEvent | BotCommandArgument> = await ArgumentParser.instance
				// @ts-ignore
				.parseCommand(command.__proto__.constructor, envt)
				.catch(e => e);
			if (args instanceof Error) {
				message.channel.send(this.error(args.message));
				return;
			}
			args[0] = envt;
			const ret = await command.run.apply(command, args);
			if (ret) {
				await sendMessage(message.channel, ret);
			}
		} catch (e) {
			this.log.error(`Error running command ${command.name}`);
			this.log.error(e);
		}
	}
	public async checkUserPerm(command: BotCommand, message: Discord.Message, hideErrors = false): Promise<boolean> {
		if (command.name == "override" && message.author.id == this.options.ownerID) return true;
		let hasPerm = false;
		for (let perm of command.permissions) {
			if (await this.permissions.check(message.author.id, perm)) {
				hasPerm = true;
				break;
			}
		}
		if (!hasPerm) {
			if (!hideErrors) {
				// User ran command they didn't have permission for, log warning and check how we should let the user know they don't have perms
				this.log.warn(
					`User ${message.author.username} (${message.author.id}) attempted to run ${
						command.name
					} without matching the required perms ${command.permissions.join(", ")}`
				);
				const event = new CommandEvent(this, message, this.userApp, command);
				const ret = await command.noPermError(event);
				if (ret) sendMessage(message.channel, ret);
			}
			return false;
		}
		return true;
	}
	// Log any command that is ran
	private logCommand(message: Discord.Message) {
		const command = message.content
			.split("")
			.map(c => (c == "\n" ? "  " : c))
			.join("");
		if (message.guild) {
			this.log.info(`${message.author.username} (${message.author.id}) ran "${command}" in ${message.guild.name} (${message.guild.id})`);
		} else {
			this.log.info(`${message.author.username} (${message.author.id}) ran "${command}" in DMs`);
		}
	}
	// A simple embed generator
	private makeEmbed(embedOpts: EmbedOptions) {
		const emb = new Discord.EmbedBuilder();
		if (embedOpts.title) emb.setTitle(embedOpts.title);
		if (embedOpts.desc) emb.setDescription(embedOpts.desc);
		if (embedOpts.color) emb.setColor(embedOpts.color);
		if (embedOpts.setTimestamp) emb.setTimestamp();
		return emb;
	}
	// Basic helper functions for returning a standard error/success value
	public error(str: string, ephemeral = false) {
		return {
			embeds: [
				this.makeEmbed({
					title: "Error",
					desc: str,
					color: "#ff0000"
				})
			],
			ephemeral: ephemeral
		};
	}
	public success(str: string, ephemeral = false) {
		return {
			embeds: [
				this.makeEmbed({
					title: "Done",
					desc: str,
					color: "#00ff00"
				})
			],
			ephemeral: ephemeral
		};
	}
	public info(str: string, ephemeral = false) {
		return {
			embeds: [
				this.makeEmbed({
					title: "Info",
					desc: str,
					color: "#0000ff"
				})
			],
			ephemeral: ephemeral
		};
	}
}
interface DiscordSendable {
	content?: string;
	embeds?: (Discord.Embed | Discord.EmbedBuilder)[];
	ephemeral?: boolean;
}
async function sendMessage(channel: TextBasedChannel, msg: Sendable) {
	if (typeof msg == "string") {
		while (msg.length) {
			await channel.send(msg.substring(0, 2000));
			msg = msg.substring(2000);
		}
	} else {
		if (msg instanceof Discord.Embed || msg instanceof Discord.EmbedBuilder) {
			await channel.send({ embeds: [msg] });
		} else {
			await channel.send(msg);
		}
	}
}
function toDiscordSendable(msg: Sendable): DiscordSendable {
	if (typeof msg == "string") {
		return { content: msg };
	} else if (msg instanceof Discord.Embed || msg instanceof Discord.EmbedBuilder) {
		return { embeds: [msg] };
	} else {
		return msg;
	}
}
function isMultiCommand(command: BotCommand): command is MultiCommand {
	return (command as MultiCommand).subCommands != undefined;
}
export default FrameworkClient;
export { sendMessage, isMultiCommand, toDiscordSendable, DiscordSendable };
