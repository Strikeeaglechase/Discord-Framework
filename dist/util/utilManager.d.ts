import Discord, { TextBasedChannel } from "discord.js";
import FrameworkClient from "../app.js";
import { ButtonSelectOption } from "./buttonSelects.js";
import { DisplayIdOpts } from "./dispalyID.js";
import { ButtonOption } from "./inputs/getButton.js";
import { SelectOption } from "./inputs/getDropdown.js";
import { DisplayFunc, ObjectBuilder, Question } from "./objectBuilder.js";
import { EmbedCallback, NamedPage, NamedPageEmbed, NumberedPage, NumberedPageEmbed } from "./pagedEmbed.js";
import { ConfirmOptions } from "./reactConfirm.js";
declare class UtilityManager {
    private framework;
    constructor(framework: FrameworkClient);
    displayId(id: string, guild?: Discord.Guild, opts?: DisplayIdOpts): Promise<string>;
    objectBuilder<Obj>(display: DisplayFunc, message: Discord.Message, questions: Question[]): ObjectBuilder<Obj>;
    parseQuotes(str: string): string[];
    reactConfirm(prompt: string, message: Discord.Message, opts?: ConfirmOptions): Promise<boolean>;
    reactConfirm(prompt: string, channel: TextBasedChannel, userId: string, opts?: ConfirmOptions): Promise<boolean>;
    resolveUser(resolvable: string, guild?: Discord.Guild): Promise<Discord.User>;
    namedPageEmbed(message: Discord.Message, base: EmbedCallback, init: EmbedCallback, pages: NamedPage[]): NamedPageEmbed;
    numberPageEmbed(message: Discord.Message, base: EmbedCallback, init: EmbedCallback, pages: NumberedPage[]): NumberedPageEmbed;
    getString(message: Discord.Message, prompt: Discord.EmbedBuilder): Promise<string>;
    getSelect(message: Discord.Message, prompt: Discord.EmbedBuilder, options: SelectOption[], values?: number): Promise<string[]>;
    getButton(message: Discord.Message, prompt: Discord.EmbedBuilder, options: ButtonOption[]): Promise<string>;
    getButtonSelect(message: Discord.Message, prompt: Discord.EmbedBuilder, options: ButtonSelectOption[]): Promise<void>;
}
export { UtilityManager };
