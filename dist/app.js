var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// This file is the main entry point for my custom framework wrapper around discord.js
import "reflect-metadata";
import "./set.js";
import Discord from "discord.js";
import fs from "fs";
import { ArgumentParser } from "./argumentParser.js";
import { CommandEvent, Command } from "./command.js";
import { ConfigManager } from "./configManager.js";
import Database from "./database.js";
import { defaultFrameworkOpts } from "./interfaces.js";
import Logger from "./logger.js";
import { PermissionManager } from "./permissions.js";
import { UtilityManager } from "./util/utilManager.js";
class FrameworkClient {
    constructor(opts) {
        this.overrides = [];
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
    loadOpts(opts) {
        Object.keys(defaultFrameworkOpts).forEach(key => {
            if (!opts.hasOwnProperty(key)) {
                opts[key] = defaultFrameworkOpts[key];
            }
        });
        return opts;
    }
    // Initializes the framework
    init(application) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log.info("Starting bot");
            this.userApp = application;
            this.client = new Discord.Client(this.options.clientOptions);
            this.client.login(this.options.token);
            this.initEventHandlers();
            yield this.database.init();
            yield this.config.init();
            yield this.permissions.init();
            yield this.botReady;
            yield this.loadBotCommands(this.options.commandsPath);
            yield this.config.addKey("prefix", this.options.defaultPrefix);
        });
    }
    // Sets up all the event handlers the framework listens to
    initEventHandlers() {
        this.client.on("ready", () => {
            this.log.setClient(this.client);
            this.log.info(`Client started up. Logged in as ${this.client.user.username} (${this.client.user.id})`);
            this.botReadyResolve();
        });
        this.client.on("message", (msg) => {
            if (msg.author.bot)
                return;
            msg.initTime = Date.now(); // aaaa this is bad but I like the data
            this.handleMessage(msg);
        });
        this.client.on(`error`, this.log.cb.error);
        // this.client.on("warn", this.log.cb.warn);
        this.client.on("guildCreate", (guild) => __awaiter(this, void 0, void 0, function* () {
            this.log.info(`Bot joined new guild ${guild.name} (${guild.id}) with ${guild.memberCount} members. Creating new config entry.`);
            yield this.config.onGuildJoin(guild.id);
        }));
        this.client.on("guildDelete", (guild) => __awaiter(this, void 0, void 0, function* () {
            this.log.info(`Bot left or was removed from guild ${guild.name} (${guild.id}). Removing config entry.`);
            yield this.config.onGuildLeave(guild.id);
        }));
        this.client.on("guildMemberAdd", (member) => {
            this.permissions.clearUserTracks(member.id);
        });
        // Listens for slash command interactions. If received, handle it.
        this.client.on("interactionCreate", (interaction) => __awaiter(this, void 0, void 0, function* () {
            if (!interaction.isCommand())
                return;
            yield this.handleSlashCommand(interaction);
        }));
    }
    // Gets the files in whatever path points to, and iterates over all the js files to be loaded as commands
    // Mask enforces only specific files are loaded (useful for defaults)
    loadBotCommands(path, mask) {
        return __awaiter(this, void 0, void 0, function* () {
            const newCommands = yield this.fetchBotCommands(path);
            const masked = newCommands.filter(command => {
                if (!mask)
                    return true;
                return mask.some(maskName => command.name == maskName);
            });
            this.botCommands = this.botCommands.concat(masked);
            const perms = new Set();
            function assignPerms(command) {
                command.permissions.push("command" + command.category + "." + command.name);
                command.permissions.forEach(perm => perms.add(perm));
                if (isMultiCommand(command)) {
                    command.subCommands.forEach(sc => {
                        if (sc.name != command.name)
                            assignPerms(sc);
                    });
                }
            }
            this.botCommands.forEach(assignPerms);
            this.slashCommands.forEach(assignPerms);
            this.permissions.loadPerms([...perms]);
        });
    }
    /**
     * Load a slash command. This is a separate method from loadBotCommands because it is a different type of command.
     * @param command The command to register
     * @returns void
     */
    loadSlashCommand(command) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // Create the command data
            const data = {
                name: command.name,
                description: command.help.msg,
                options: command.slashOptions
            };
            // Register the command
            yield ((_a = this.client.application) === null || _a === void 0 ? void 0 : _a.commands.create(data));
            this.log.info("Registered slash command " + command.name);
            return;
        });
    }
    /**
     * Deletes all commands from this application. Can be toggled on with `slashCommandReset` in the FrameworkOptions.
     * @returns void
     */
    deleteSlashCommands() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            yield ((_a = this.client.application) === null || _a === void 0 ? void 0 : _a.commands.set([]));
            this.log.info("Deleted all slash commands");
            return;
        });
    }
    fetchBotCommands(path, catTag = "") {
        return __awaiter(this, void 0, void 0, function* () {
            const files = fs.readdirSync(path);
            this.log.info(`Found files in ${path.substring(path.lastIndexOf('/', path.length - 2))} folder: ${files.join(", ")}`);
            const commandsImports = files.map((file) => __awaiter(this, void 0, void 0, function* () {
                if (fs.statSync(path + file).isDirectory()) {
                    const newTag = catTag + "." + file;
                    const subcommands = yield this.fetchBotCommands(path + file + "/", newTag);
                    const base = subcommands.find(subcommand => subcommand.name == file);
                    if (base) {
                        base.subCommands = subcommands;
                        subcommands.forEach(sc => {
                            if (sc != base)
                                sc.parent = base;
                        });
                        return base;
                    }
                    else {
                        return subcommands;
                    }
                }
                if (!file.endsWith(".js")) {
                    if (!file.endsWith(".d.ts"))
                        this.log.warn(`Command file ${path + file} does not end with ".js" thus will be omitted for import`);
                    return null;
                }
                const imported = yield import("file://" + path + file);
                const command = new imported.default();
                command.category = catTag;
                return command;
            }));
            const imported = yield Promise.all(commandsImports);
            // Check to see if we are forced to reset all slash commands.
            // This can be useful in the event a bad command got registered and needs to be removed.
            if (this.options.slashCommandReset) {
                yield this.deleteSlashCommands();
            }
            // Loop over all command and verify if one of them is a slash command.
            // If a command is one, it is moved to the slashCommands array and removed from the imported array.
            // Then, it will register itself as a slash command.
            imported.forEach((element) => __awaiter(this, void 0, void 0, function* () {
                if (element instanceof Command) {
                    if (element.slashCommand) {
                        yield this.loadSlashCommand(element);
                        // Yes, I am doing this on this and yes, this is not a good idea. It just gotta work now.
                        this.slashCommands.push(element);
                        imported.splice(imported.indexOf(element), 1);
                    }
                }
            }));
            return imported.filter(obj => obj != null).flat();
        });
    }
    // Handles the bot being mentioned, we want to tell the user what the prefix is in case they don't know it
    handleMention(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.options.dmPrefixOnPing)
                return;
            try {
                if (message.guild) {
                    message.member.send({ embeds: [this.makeEmbed({ desc: `The prefix for ${message.guild.name} is \`${yield this.config.getKey(message.guild.id, "prefix")}\`` })] });
                }
                else {
                    message.member.send({ embeds: [this.makeEmbed({ desc: `The prefix for ${this.options.name} is \`${this.options.defaultPrefix}\`` })] });
                }
            }
            catch (e) {
                this.log.error(e);
            }
        });
    }
    // Primary message handler that executes commands
    handleMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const ments = message.mentions.members;
            if (ments &&
                ments.first() &&
                ments.first().user.id == this.client.user.id) {
                yield this.handleMention(message);
            }
            // Gets the command that was executed, requires that prefix is one char long. Command names are case insensitive
            const commandStr = message.content
                .substring(1)
                .split(" ")[0]
                .toLowerCase();
            // Resolve the prefix for the guild (need to check command was run with correct prefix)
            const prefix = message.guild ? (yield this.config.getKey(message.guild.id, "prefix")) : this.options.defaultPrefix;
            if (!message.content.startsWith(prefix)) {
                return;
            }
            this.handleCommand(commandStr, message);
        });
    }
    handleCommand(commandString, message, commandsList = this.botCommands, event, cmdDpth = 1) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            // console.log(`CMD STR: ${commandString}`);
            const command = commandsList.find((botCommand) => {
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
            if (command.slashCommand) {
                yield message.channel.send("This command is a slash command.");
                return;
            }
            if (command) {
                this.logCommand(message);
                const hasPerm = yield this.checkUserPerm(command, message);
                if (!hasPerm)
                    return;
                // console.log(" - " + command.name + ": " + isMultiCommand(command));
                if (isMultiCommand(command)) {
                    const subCommandStr = (_a = message.content.split(" ")[cmdDpth]) === null || _a === void 0 ? void 0 : _a.toLowerCase();
                    // console.log(` - Sub cmd str: ${subCommandStr} (${command.name})`);
                    if (!subCommandStr || subCommandStr == command.name || ((_b = command.altNames) === null || _b === void 0 ? void 0 : _b.includes(subCommandStr)))
                        return yield this.execCommand(command, message);
                    // console.log(` - ${command.subCommands.map(c => c.name).join(", ")}`);
                    let envt = event ? event : new CommandEvent(this, message, this.userApp, command);
                    // envt.command = command;
                    if (command.check) {
                        const subCheck = yield command.check(envt);
                        if (!subCheck.pass) {
                            return yield sendMessage(message.channel, subCheck.failMessage);
                        }
                        envt = subCheck.event;
                    }
                    yield this.handleCommand(subCommandStr, message, command.subCommands, envt, cmdDpth + 1);
                }
                else {
                    if (event)
                        event.updateCommand(command); // Event may have started as a sub-command, so make sure this is correct
                    yield this.execCommand(command, message, event);
                }
            }
        });
    }
    /**
     * Handle the execution of a Slash Command.
     * @param interaction The interaction that was received.
     * @returns void
     */
    handleSlashCommand(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            let commandName = interaction.commandName.toLowerCase();
            let command = this.slashCommands.find(cmd => cmd.name.toLowerCase() == commandName);
            // If by some weird reason a slash command is executed that is not registered, we need to abort it and send an error message.
            if (!command)
                (interaction.reply({ content: "This command does not exist.", ephemeral: true }));
            if (this.checkUserPermSlash(command, interaction)) {
                const event = new CommandEvent(this, null, this.userApp, command, interaction);
                yield command.run(event);
            }
            return;
        });
    }
    execCommand(command, message, event) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Execute the command and if there is a return output it
                const envt = event ? event : new CommandEvent(this, message, this.userApp, command);
                // @ts-ignore
                const args = yield ArgumentParser.instance.parseCommand(command.__proto__.constructor, envt).catch((e) => e);
                if (args instanceof Error) {
                    message.channel.send(this.error(args.message));
                    return;
                }
                args[0] = envt;
                const ret = yield command.run.apply(command, args);
                if (ret) {
                    yield sendMessage(message.channel, ret);
                }
            }
            catch (e) {
                this.log.error(`Error running command ${command.name}`);
                this.log.error(e);
            }
        });
    }
    /**
     * Check to see if a user has permissions to run a Slash Command.
     * @param command The command to check
     * @param interaction The interaction provided by the command
     * @returns Does user have permissions to run this command?
     */
    checkUserPermSlash(command, interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            let hasPerm = false;
            for (let perm of command.permissions) {
                if (yield this.permissions.check(interaction.user.id, perm)) {
                    hasPerm = true;
                    break;
                }
            }
            return hasPerm;
        });
    }
    checkUserPerm(command, message, hideErrors = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (command.name == "override" && message.author.id == this.options.ownerID)
                return true;
            let hasPerm = false;
            for (let perm of command.permissions) {
                if (yield this.permissions.check(message.author.id, perm)) {
                    hasPerm = true;
                    break;
                }
            }
            if (!hasPerm) {
                if (!hideErrors) {
                    // User ran command they didn't have permission for, log warning and check how we should let the user know they don't have perms
                    this.log.warn(`User ${message.author.username} (${message.author.id}) attempted to run ${command.name} without matching the required perms ${command.permissions.join(", ")}`);
                    const event = new CommandEvent(this, message, this.userApp, command);
                    const ret = yield command.noPermError(event);
                    if (ret)
                        sendMessage(message.channel, ret);
                }
                return false;
            }
            return true;
        });
    }
    // Log any command that is ran
    logCommand(message) {
        const command = message.content
            .split("")
            .map((c) => (c == "\n" ? "  " : c))
            .join("");
        if (message.guild) {
            this.log.info(`${message.author.username} (${message.author.id}) ran "${command}" in ${message.guild.name} (${message.guild.id})`);
        }
        else {
            this.log.info(`${message.author.username} (${message.author.id}) ran "${command}" in DMs`);
        }
    }
    // A simple embed generator
    makeEmbed(embedOpts) {
        const emb = new Discord.MessageEmbed();
        if (embedOpts.title)
            emb.setTitle(embedOpts.title);
        if (embedOpts.desc)
            emb.setDescription(embedOpts.desc);
        if (embedOpts.color)
            emb.setColor(embedOpts.color);
        if (embedOpts.setTimestamp)
            emb.setTimestamp();
        return emb;
    }
    // Basic helper functions for returning a standard error/success value
    error(str, ephemeral = false) {
        return {
            embeds: [this.makeEmbed({
                    title: "Error",
                    desc: str,
                    color: "#ff0000"
                })],
            ephemeral: ephemeral
        };
    }
    success(str, ephemeral = false) {
        return {
            embeds: [this.makeEmbed({
                    title: "Done",
                    desc: str,
                    color: "#00ff00"
                })],
            ephemeral: ephemeral
        };
    }
    info(str, ephemeral = false) {
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
function sendMessage(channel, msg) {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof msg == "string") {
            while (msg.length) {
                yield channel.send(msg.substring(0, 2000));
                msg = msg.substring(2000);
            }
        }
        else {
            if (msg instanceof Discord.MessageEmbed) {
                yield channel.send({ embeds: [msg] });
            }
            else {
                yield channel.send(msg);
            }
        }
    });
}
function toDiscordSendable(msg) {
    if (typeof msg == "string") {
        return { content: msg };
    }
    else if (msg instanceof Discord.MessageEmbed) {
        return { embeds: [msg] };
    }
    else {
        return msg;
    }
}
function isMultiCommand(command) {
    return command.subCommands != undefined;
}
export default FrameworkClient;
export { sendMessage, isMultiCommand, toDiscordSendable };
