import Discord, { ButtonBuilder, StringSelectMenuBuilder, TextBasedChannel } from "discord.js";
import FrameworkClient from "../app.js";
type EmbedCallback = () => Discord.EmbedBuilder | Promise<Discord.EmbedBuilder>;
interface NamedPage {
    name: string;
    description?: string;
    emoji?: string;
    get(existing: Discord.EmbedBuilder, name: string): Discord.EmbedBuilder | Promise<Discord.EmbedBuilder>;
}
type NumberedPage = (existing: Discord.EmbedBuilder, index: number) => Discord.EmbedBuilder | Promise<Discord.EmbedBuilder>;
declare class PagedEmbed {
    framework: FrameworkClient;
    channel: TextBasedChannel;
    userId: string;
    base: EmbedCallback;
    init: EmbedCallback;
    message: Discord.Message;
    curEmbed: Discord.EmbedBuilder;
    firstReply: Discord.MessageComponentInteraction;
    constructor(framework: FrameworkClient, channel: TextBasedChannel, userId: string, base: EmbedCallback, init: EmbedCallback);
    start(): Promise<void>;
    getComps(): Promise<Discord.ActionRowBuilder<StringSelectMenuBuilder | ButtonBuilder>[]>;
    handleCollect(interaction: Discord.MessageComponentInteraction): Promise<void>;
}
declare class NamedPageEmbed extends PagedEmbed {
    private pages;
    constructor(framework: FrameworkClient, channel: TextBasedChannel, userId: string, base: EmbedCallback, init: EmbedCallback, pages: NamedPage[]);
    handleCollect(interaction: Discord.MessageComponentInteraction): Promise<void>;
    getComps(): Promise<Discord.ActionRowBuilder<Discord.StringSelectMenuBuilder>[]>;
}
declare class NumberedPageEmbed extends PagedEmbed {
    private pages;
    private index;
    constructor(framework: FrameworkClient, channel: TextBasedChannel, userId: string, base: EmbedCallback, init: EmbedCallback, pages: NumberedPage[]);
    handleCollect(interaction: Discord.MessageComponentInteraction): Promise<void>;
    getComps(): Promise<Discord.ActionRowBuilder<Discord.ButtonBuilder>[]>;
}
export { NamedPageEmbed, NumberedPageEmbed, NamedPage, NumberedPage, EmbedCallback };
