import Discord from "discord.js";
import FrameworkClient, { MessageChannel } from "../app.js";
type EmbedCallback = () => Discord.MessageEmbed | Promise<Discord.MessageEmbed>;
interface NamedPage {
    name: string;
    description?: string;
    emoji?: string;
    get(existing: Discord.MessageEmbed, name: string): Discord.MessageEmbed | Promise<Discord.MessageEmbed>;
}
type NumberedPage = (existing: Discord.MessageEmbed, index: number) => Discord.MessageEmbed | Promise<Discord.MessageEmbed>;
declare class PagedEmbed {
    framework: FrameworkClient;
    channel: MessageChannel;
    userId: string;
    base: EmbedCallback;
    init: EmbedCallback;
    message: Discord.Message;
    curEmbed: Discord.MessageEmbed;
    firstReply: Discord.MessageComponentInteraction;
    constructor(framework: FrameworkClient, channel: MessageChannel, userId: string, base: EmbedCallback, init: EmbedCallback);
    start(): Promise<void>;
    getComps(): Promise<Discord.MessageActionRow[]>;
    handleCollect(interaction: Discord.MessageComponentInteraction): Promise<void>;
}
declare class NamedPageEmbed extends PagedEmbed {
    private pages;
    constructor(framework: FrameworkClient, channel: MessageChannel, userId: string, base: EmbedCallback, init: EmbedCallback, pages: NamedPage[]);
    handleCollect(interaction: Discord.MessageComponentInteraction): Promise<void>;
    getComps(): Promise<Discord.MessageActionRow[]>;
}
declare class NumberedPageEmbed extends PagedEmbed {
    private pages;
    private index;
    constructor(framework: FrameworkClient, channel: MessageChannel, userId: string, base: EmbedCallback, init: EmbedCallback, pages: NumberedPage[]);
    handleCollect(interaction: Discord.MessageComponentInteraction): Promise<void>;
    getComps(): Promise<Discord.MessageActionRow[]>;
}
export { NamedPageEmbed, NumberedPageEmbed, NamedPage, NumberedPage, EmbedCallback };
