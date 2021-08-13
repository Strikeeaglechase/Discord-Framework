import "reflect-metadata";
import Discord from "discord.js";
import "./set.js";
import Database from "./database.js";
import Logger from "./logger.js";
import { PermissionManager } from "./permissions.js";
import { UtilityManager } from "./util/utilManager.js";
import { FrameworkClientOptions } from "./interfaces.js";
import { BotCommand, Sendable, MultiCommand } from "./command.js";
import { ConfigManager } from "./configManager.js";
export declare type MessageChannel = Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel | Discord.ThreadChannel | Discord.PartialDMChannel;
declare class FrameworkClient {
    client: Discord.Client;
    botCommands: BotCommand[];
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
    private fetchBotCommands;
    private handleMention;
    private handleMessage;
    private handleCommand;
    private execCommand;
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
