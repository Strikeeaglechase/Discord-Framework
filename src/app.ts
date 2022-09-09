// This file is the main entry point for my custom framework wrapper around discord.js
import "reflect-metadata";
import "./set.js";

import Discord, { CommandInteraction } from "discord.js";
import fs from "fs";

import { ArgumentParser } from "./argumentParser.js";
import { BotCommand, BotCommandArgument, CommandEvent, MultiCommand, Sendable, Command, SlashCommand, SlashCommandEvent } from "./command.js";
import { ConfigManager } from "./configManager.js";
import Database from "./database.js";
import { defaultFrameworkOpts, EmbedOptions, FrameworkClientOptions } from "./interfaces.js";
import Logger from "./logger.js";
import { PermissionManager } from "./permissions.js";
import { UtilityManager } from "./util/utilManager.js";

export type MessageChannel = Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel | Discord.ThreadChannel | Discord.PartialDMChannel;
class FrameworkClient {
	public client: Discord.Client;
	public botCommands: BotCommand[];
	public slashCommands: SlashCommand[];
	public database: Database;
	public permissions: PermissionManager;
	public log: Logger;
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
		this.database = new Database(opts.databaseOpts, this.log);
		this.permissions = new PermissionManager(this);
		this.config = new ConfigManager(this);
		ArgumentParser.instance.framework = this;
		this.botCommands = [];
		this.slashCommands = [];
		// Setup the awaitable promises
		this.botReady = new Promise((resolve) => this.botReadyResolve = resolve);
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
		await this.slashCommandCheck(); // Check to see if we need to reset slash commands.
		await this.loadBotCommands(this.options.commandsPath);
		await this.config.addKey("prefix", this.options.defaultPrefix);
	}
	// Sets up all the event handlers the framework listens to
	private initEventHandlers() {
		this.client.on("ready", () => {
			this.log.setClient(this.client);
			this.log.info(`Client started up. Logged in as ${this.client.user.username} (${this.client.user.id})`);
			this.botReadyResolve();
		});
		this.client.on("message", (msg) => { // Using old "message" rather than "messageCreate" because djs dumb
			if (msg.author.bot) return;
			msg.initTime = Date.now(); // aaaa this is bad but I like the data
			this.handleMessage(msg);
		});
		this.client.on(`error`, this.log.cb.error);
		// this.client.on("warn", this.log.cb.warn);
		this.client.on("guildCreate", async (guild) => {
			this.log.info(`Bot joined new guild ${guild.name} (${guild.id}) with ${guild.memberCount} members. Creating new config entry.`);
			await this.config.onGuildJoin(guild.id);
		});
		this.client.on("guildDelete", async (guild) => {
			this.log.info(`Bot left or was removed from guild ${guild.name} (${guild.id}). Removing config entry.`);
			await this.config.onGuildLeave(guild.id);
		});
		this.client.on("guildMemberAdd", (member) => {
			this.permissions.clearUserTracks(member.id);
		});

		// Listens for slash command interactions. If received, handle it.
		this.client.on("interactionCreate", async (interaction) => {
			if(!interaction.isCommand()) return;
			await this.handleSlashCommand(interaction);

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
		this.slashCommands.forEach(assignPerms);
		this.permissions.loadPerms([...perms]);
	}

	/**
	 * This function checks if slash commands need to be reset. If they do, it will reset them.
	 */
	private async slashCommandCheck() {
		// Check to see if we are forced to reset all slash commands.
		// This can be useful in the event a bad command got registered and needs to be removed.
		if (this.options.slashCommandReset) {
			await this.deleteSlashCommands();
		}
		return;
	}

	/**
	 * Load a slash command. This is a separate method from loadBotCommands because it is a different type of command.
	 * @param command The command to register
	 * @returns void
	 */
	private async loadSlashCommand(command: SlashCommand) {
		// Create the command data
		const data = {
			name: command.name,
			description: command.help.msg,
			options: command.slashOptions
		};
		// Register the command
		await this.client.application?.commands.create(data);
		this.log.info("Registered slash command " + command.name);
		return;
	}

	/**
	 * Deletes all commands from this application. Can be toggled on with `slashCommandReset` in the FrameworkOptions.
	 * @returns void
	 */
	private async deleteSlashCommands() {
		await this.client.application?.commands.set([]);
		this.log.info("Deleted all slash commands");
		return;
	}
	
	private async fetchBotCommands(path: string, catTag: string = ""): Promise<BotCommand[]> {
		const files = fs.readdirSync(path);
		this.log.info(`Found files in ${path.substring(path.lastIndexOf('/', path.length - 2))} folder: ${files.join(", ")}`);
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
			const imported: { default: new () => BotCommand; } = await import("file://" + path + file);
			const command = new imported.default();
			command.category = catTag;
			return command;
		});
		const imported = await Promise.all(commandsImports);

		// We check if catTag is set. This can only happen if this function is NOT called by this.init()
		// This check makes sure slash commands are ONLY loaded on Initialisation.
		if(catTag == "") {
			// Loop over all command and verify if one of them is a slash command.
			// If a command is one, it is moved to the slashCommands array and removed from the imported array.
			// Then, it will register itself as a slash command.
			imported.forEach(async element => {
				if(element instanceof Command) {
					if(element instanceof SlashCommand) {
						await this.loadSlashCommand(element);

						// Yes, I am doing this on this and yes, this is not a good idea. It just gotta work now.
						this.slashCommands.push(element);
					}
				}

			});

			// Clean up the slash commands from the imported array.
			this.slashCommands.forEach(slashCommand => {
				// Check to see if the array even contains the slash command.
				// In regular operation it will always return true.
				// This is just here as a failsafe in case things get funky.
				if(imported.includes(slashCommand)){
					imported.splice(imported.indexOf(slashCommand), 1);
				} else this.log.error(`Slash command ${slashCommand.name} was not found in the imported array. Something went severely wrong.`);
			})
		}
		return imported.filter(obj => obj != null).flat() as BotCommand[];
	}
	// Handles the bot being mentioned, we want to tell the user what the prefix is in case they don't know it
	private async handleMention(message: Discord.Message) {
		if (!this.options.dmPrefixOnPing) return;
		try {
			if (message.guild) {
				message.member.send({ embeds: [this.makeEmbed({ desc: `The prefix for ${message.guild.name} is \`${await this.config.getKey(message.guild.id, "prefix")}\`` })] });
			} else {
				message.member.send({ embeds: [this.makeEmbed({ desc: `The prefix for ${this.options.name} is \`${this.options.defaultPrefix}\`` })] });
			}
		} catch (e) {
			this.log.error(e);
		}
	}
	// Primary message handler that executes commands
	private async handleMessage(message: Discord.Message) {
		const ments = message.mentions.members;
		if (
			ments &&
			ments.first() &&
			ments.first().user.id == this.client.user.id
		) {
			await this.handleMention(message);
		}
		// Gets the command that was executed, requires that prefix is one char long. Command names are case insensitive
		const commandStr = message.content
			.substring(1)
			.split(" ")[0]
			.toLowerCase();
		// Resolve the prefix for the guild (need to check command was run with correct prefix)
		const prefix = message.guild ? (await this.config.getKey(message.guild.id, "prefix")) : this.options.defaultPrefix;
		if (!message.content.startsWith(prefix)) {
			return;
		}
		this.handleCommand(commandStr, message);
	}
	private async handleCommand(commandString: string, message: Discord.Message, commandsList = this.botCommands, event?: CommandEvent, cmdDpth = 1) {
		// console.log(`CMD STR: ${commandString}`);
		const command: BotCommand = commandsList.find((botCommand) => {
			const nameList = Array.isArray(botCommand.altNames) ?
				botCommand.altNames.concat([botCommand.name]) :
				[botCommand.name];
			return nameList.includes(commandString);
		});
		if (!command) {
			return;
		}
		// Make sure command can be run in a DM channel if it is in a DM
		if ((!command.allowDM && message.channel.type == "DM")) {
			if (!this.options.dmErrorSilently) {
				message.channel.send(this.error(`This command does not work in DMs, please run it in a server instead`));
			}
			return;
		}

		// Check if this command is actually a slash command. If it is, this needs to be aborted since it is a slash command.
		if(command instanceof SlashCommand) {
			await message.channel.send("This command is a slash command.")
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
	
	/**
	 * Handle the execution of a Slash Command.
	 * @param interaction The interaction that was received.
	 * @returns void
	 */
	private async handleSlashCommand(interaction: Discord.CommandInteraction) {
		let commandName = interaction.commandName.toLowerCase();
		let command:SlashCommand = this.slashCommands.find(cmd => cmd.name.toLowerCase() == commandName);

		// If by some weird reason a slash command is executed that is not registered, we need to abort it and send an error message.
		if(!command) {interaction.reply({ content: "This command does not exist.", ephemeral: true });return};

		if(this.checkUserPermSlash(command, interaction)) {
			this.log.info(`Slash Command ${command.name} executed by ${interaction.user.username}#${interaction.user.discriminator} (${interaction.user.id})`);
			const event = new SlashCommandEvent(this,interaction,this.userApp,command);
			const ret = await command.run(event);
			if(ret) {
				slashReply(interaction,ret);
			}
		}
		return;
	}
	private async execCommand(command: BotCommand, message: Discord.Message, event?: CommandEvent) {
		try {
			// Execute the command and if there is a return output it
			const envt = event ? event : new CommandEvent(this, message, this.userApp, command);
			// @ts-ignore
			const args: Array<CommandEvent | BotCommandArgument> = await ArgumentParser.instance.parseCommand(command.__proto__.constructor, envt).catch((e) => e);
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

	/**
	 * Check to see if a user has permissions to run a Slash Command.
	 * @param command The command to check
	 * @param interaction The interaction provided by the command
	 * @returns Does user have permissions to run this command?
	 */
	public async checkUserPermSlash(command: Command, interaction: Discord.CommandInteraction):Promise<boolean> {
		let hasPerm = false;
		for (let perm of command.permissions) {
			if (await this.permissions.check(interaction.user.id, perm)) {
				hasPerm = true;
				break;
			}
		}
		return hasPerm;
		
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
				this.log.warn(`User ${message.author.username} (${message.author.id}) attempted to run ${command.name} without matching the required perms ${command.permissions.join(", ")}`);
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
			.map((c) => (c == "\n" ? "  " : c))
			.join("");
		if (message.guild) {
			this.log.info(
				`${message.author.username} (${message.author.id}) ran "${command}" in ${message.guild.name} (${message.guild.id})`
			);
		} else {
			this.log.info(
				`${message.author.username} (${message.author.id}) ran "${command}" in DMs`
			);
		}
	}
	// A simple embed generator
	private makeEmbed(embedOpts: EmbedOptions) {
		const emb = new Discord.MessageEmbed();
		if (embedOpts.title) emb.setTitle(embedOpts.title);
		if (embedOpts.desc) emb.setDescription(embedOpts.desc);
		if (embedOpts.color) emb.setColor(embedOpts.color);
		if (embedOpts.setTimestamp) emb.setTimestamp();
		return emb;
	}
	// Basic helper functions for returning a standard error/success value
	public error(str: string, ephemeral = false) {
		return {
			embeds: [this.makeEmbed({
				title: "Error",
				desc: str,
				color: "#ff0000"
			})],
			ephemeral: ephemeral
		};
	}
	public success(str: string, ephemeral = false) {
		return {
			embeds: [this.makeEmbed({
				title: "Done",
				desc: str,
				color: "#00ff00"
			})],
			ephemeral: ephemeral
		};
	}
	public info(str: string, ephemeral = false) {
		return {
			embeds: [this.makeEmbed({
				title: "Info",
				desc: str,
				color: "#0000ff"
			})],
			ephemeral: ephemeral
		};
	}
}
interface DiscordSendable {
	content?: string;
	embeds?: Discord.MessageEmbedOptions[];
	ephemeral?: boolean;
}
async function sendMessage(channel: MessageChannel, msg: Sendable) {
	if (typeof msg == "string") {
		while (msg.length) {
			await channel.send(msg.substring(0, 2000));
			msg = msg.substring(2000);
		}
	} else {
		if (msg instanceof Discord.MessageEmbed) {
			await channel.send({ embeds: [msg] });
		} else {
			await channel.send(msg);
		}
	}
}

/**
 * Does exactly the same as sendMessage, except this uses the interaction.reply function instead of channel.send.
 * @param interaction The interaction to respond to
 * @param msg Message to send (String/Embed)
 */
async function slashReply(interaction:CommandInteraction,msg:Sendable) {
	if (typeof msg == "string") {
		while (msg.length) {
			await interaction.reply(msg.substring(0, 2000));
			msg = msg.substring(2000);
		}
	} else {
		if (msg instanceof Discord.MessageEmbed) {
			await interaction.reply({ embeds: [msg] });
		} else {
			await interaction.reply(msg);
		}
	}
}
function toDiscordSendable(msg: Sendable): DiscordSendable {
	if (typeof msg == "string") {
		return { content: msg };
	} else if (msg instanceof Discord.MessageEmbed) {
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