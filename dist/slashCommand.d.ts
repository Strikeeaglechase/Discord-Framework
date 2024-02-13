import { CommandInteraction, Embed, EmbedBuilder } from "discord.js";
import FrameworkClient from "./app.js";
import { SlashCommandArgumentType } from "./slashCommandArgumentParser.js";
type Sendable = string | Embed | {
    embeds: Embed[];
} | EmbedBuilder | {
    embeds: EmbedBuilder[];
};
type BotCommandReturn = Sendable | Promise<Sendable> | void | Promise<void>;
type Constructor<T> = new (...args: any[]) => T;
declare class SlashCommandEvent<T = any> {
    command: SlashCommand;
    app: T;
    framework: FrameworkClient;
    interaction: CommandInteraction;
    constructor(framework: FrameworkClient, interaction: CommandInteraction, app: T, command: SlashCommand);
}
declare abstract class SlashCommandParent {
    abstract name: string;
    abstract description: string;
    allowDm: boolean;
    nsfw: boolean;
    defaultPermission: bigint;
    _isSubcommand: boolean;
    _parent: SlashCommandParent;
    _subCommands: SlashCommand[];
    abstract getSubCommands(): Constructor<SlashCommand>[];
}
declare abstract class SlashCommand extends SlashCommandParent {
    abstract run(event: SlashCommandEvent, ...args: SlashCommandArgumentType[]): BotCommandReturn;
    getSubCommands(): Constructor<SlashCommand>[];
}
export { SlashCommand, SlashCommandParent, SlashCommandEvent, Constructor };
