import "reflect-metadata";
import "./set.js";
import Discord, { TextBasedChannel } from "discord.js";
import { CollectionManager } from "./collectionManager.js";
import { BotCommand, MultiCommand, Sendable } from "./command.js";
import { ConfigManager } from "./configManager.js";
import Database from "./database.js";
import { DynamicMessageRef } from "./dynamicMessage.js";
import { FrameworkClientOptions } from "./interfaces.js";
import Logger from "./logger.js";
import { PermissionManager } from "./permissions.js";
import { SlashCommandParent } from "./slashCommand.js";
import { UtilityManager } from "./util/utilManager.js";
export type MessageChannel = Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel | Discord.ThreadChannel | Discord.PartialDMChannel;
declare class FrameworkClient {
    client: Discord.Client;
    botCommands: BotCommand[];
    slashCommands: SlashCommandParent[];
    database: Database;
    permissions: PermissionManager;
    log: Logger;
    dynamicMessages: CollectionManager<DynamicMessageRef<unknown>>;
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
    private loadSlashCommand;
    private finalizeSlashCommands;
    private handleMention;
    private handleSlashCommand;
    private handleAutocomplete;
    private handleMessage;
    private handleCommand;
    private execCommand;
    checkUserPerm(command: BotCommand, message: Discord.Message, hideErrors?: boolean): Promise<boolean>;
    private logCommand;
    private makeEmbed;
    error(str: string, ephemeral?: boolean): {
        embeds: Discord.EmbedBuilder[];
        ephemeral: boolean;
    };
    success(str: string, ephemeral?: boolean): {
        embeds: Discord.EmbedBuilder[];
        ephemeral: boolean;
    };
    info(str: string, ephemeral?: boolean): {
        embeds: Discord.EmbedBuilder[];
        ephemeral: boolean;
    };
}
interface DiscordSendable {
    content?: string;
    embeds?: (Discord.Embed | Discord.EmbedBuilder)[];
    ephemeral?: boolean;
}
declare function sendMessage(channel: TextBasedChannel, msg: Sendable): Promise<void>;
declare function toDiscordSendable(msg: Sendable): DiscordSendable;
declare function isMultiCommand(command: BotCommand): command is MultiCommand;
export default FrameworkClient;
export { sendMessage, isMultiCommand, toDiscordSendable, DiscordSendable };
