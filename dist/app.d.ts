import "reflect-metadata";
import "./set.js";
import Discord from "discord.js";
import { BotCommand, MultiCommand, Sendable, Command } from "./command.js";
import { ConfigManager } from "./configManager.js";
import Database from "./database.js";
import { FrameworkClientOptions } from "./interfaces.js";
import Logger from "./logger.js";
import { PermissionManager } from "./permissions.js";
import { UtilityManager } from "./util/utilManager.js";
export declare type MessageChannel = Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel | Discord.ThreadChannel | Discord.PartialDMChannel;
declare class FrameworkClient {
    client: Discord.Client;
    botCommands: BotCommand[];
    slashCommands: BotCommand[];
    database: Database;
    permissions: PermissionManager;
    log: Logger;
    dbReady: Promise<void>;
    botReady: Promise<void>;
    utils: UtilityManager;
    config: ConfigManager;
    options: FrameworkClientOptions;
    overrides: string[];
    private botReadyResolve;
    private userApp;
    constructor(opts: FrameworkClientOptions);
    private loadOpts;
    init(application?: Object): Promise<void>;
    private initEventHandlers;
    loadBotCommands(path: string, mask?: string[]): Promise<void>;
    /**
     * This function checks if slash commands need to be reset. If they do, it will reset them.
     */
    private slashCommandCheck;
    /**
     * Load a slash command. This is a separate method from loadBotCommands because it is a different type of command.
     * @param command The command to register
     * @returns void
     */
    private loadSlashCommand;
    /**
     * Deletes all commands from this application. Can be toggled on with `slashCommandReset` in the FrameworkOptions.
     * @returns void
     */
    private deleteSlashCommands;
    private fetchBotCommands;
    private handleMention;
    private handleMessage;
    private handleCommand;
    /**
     * Handle the execution of a Slash Command.
     * @param interaction The interaction that was received.
     * @returns void
     */
    private handleSlashCommand;
    private execCommand;
    /**
     * Check to see if a user has permissions to run a Slash Command.
     * @param command The command to check
     * @param interaction The interaction provided by the command
     * @returns Does user have permissions to run this command?
     */
    checkUserPermSlash(command: Command, interaction: Discord.CommandInteraction): Promise<boolean>;
    checkUserPerm(command: BotCommand, message: Discord.Message, hideErrors?: boolean): Promise<boolean>;
    private logCommand;
    private makeEmbed;
    error(str: string, ephemeral?: boolean): {
        embeds: Discord.MessageEmbed[];
        ephemeral: boolean;
    };
    success(str: string, ephemeral?: boolean): {
        embeds: Discord.MessageEmbed[];
        ephemeral: boolean;
    };
    info(str: string, ephemeral?: boolean): {
        embeds: Discord.MessageEmbed[];
        ephemeral: boolean;
    };
}
interface DiscordSendable {
    content?: string;
    embeds?: Discord.MessageEmbedOptions[];
    ephemeral?: boolean;
}
declare function sendMessage(channel: MessageChannel, msg: Sendable): Promise<void>;
declare function toDiscordSendable(msg: Sendable): DiscordSendable;
declare function isMultiCommand(command: BotCommand): command is MultiCommand;
export default FrameworkClient;
export { sendMessage, isMultiCommand, toDiscordSendable, DiscordSendable };
