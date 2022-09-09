import Discord from "discord.js";
import FrameworkClient, { MessageChannel } from "../app.js";
import { DisplayIdOpts } from "./dispalyID.js";
import { EmbedCallback, NamedPageEmbed, NamedPage, NumberedPage, NumberedPageEmbed } from "./pagedEmbed.js";
import { ConfirmOptions } from "./reactConfirm.js";
import { SelectOption } from "./inputs/getDropdown.js";
import { ButtonOption } from "./inputs/getButton.js";
import { DisplayFunc, ObjectBuilder, Question } from "./objectBuilder.js";
import { ButtonSelectOption } from "./buttonSelects.js";
declare class UtilityManager {
    private framework;
    constructor(framework: FrameworkClient);
    displayId(id: string, guild?: Discord.Guild, opts?: DisplayIdOpts): Promise<string>;
    objectBuilder<Obj>(display: DisplayFunc, message: Discord.Message, questions: Question[]): ObjectBuilder<Obj>;
    /**
     * Takes in a string, and splits the string into parts based off spaces and grouped by quotes.
     * @param str The string to parse
     * @returns string[] of the parsed string
     */
    parseQuotes(str: string): string[];
    /**
     * Create an embed asking the user to confirm something.
     * @param prompt The prompt to display
     * @param message The message object to use
     * @param opts Additional options.
     */
    reactConfirm(prompt: string, message: Discord.Message, opts?: ConfirmOptions): Promise<boolean>;
    /**
     * Create an embed asking the user to confirm something.
     * @param prompt The prompt to display
     * @param channel The channel to send the message to
     * @param userId The user to listen to
     * @param opts Additional options.
     */
    reactConfirm(prompt: string, channel: MessageChannel, userId: string, opts?: ConfirmOptions): Promise<boolean>;
    /**
     * Attemptes to resolve a Discord.User from a string, by id, name, and nickname
     * @param resolvable String to try to resolve to a user
     * @param guild Optional to help with the resolotion
     * @returns `Promise<Discord.User>` if found, otherwise null
     */
    resolveUser(resolvable: string, guild?: Discord.Guild): Promise<Discord.User>;
    /**
     * Create a paged embed. This one uses string indexs selected by the user.
     * @param message object reference sent with the command
     * @param base This is the message first sent, where either the controls for moving backwards and forwards are created, or the selection for the named pages is added
     * @param init Creates the initial emebed for the page after an interaction
     * @param pages Array of pages the user can select
     * @returns `NamedPageEmbed`
     */
    namedPageEmbed(message: Discord.Message, base: EmbedCallback, init: EmbedCallback, pages: NamedPage[]): NamedPageEmbed;
    /**
     * Create a paged embed. This one uses sequential numeric indexs selected by the user.
     * @param message object reference sent with the command
     * @param base This is the message first sent, where either the controls for moving backwards and forwards are created, or the selection for the named pages is added
     * @param init Creates the initial emebed for the page after an interaction
     * @param pages Array of pages the user can select
     * @returns `NumberedPageEmbed`
     */
    numberPageEmbed(message: Discord.Message, base: EmbedCallback, init: EmbedCallback, pages: NumberedPage[]): NumberedPageEmbed;
    /**
     * Gets a single message from the user and returns its content
     * @param message The message from the user to target user and channel
     * @param prompt The embed to send as the prompt
     * @returns `Promise<string>` the user entered value
     */
    getString(message: Discord.Message, prompt: Discord.MessageEmbed): Promise<string>;
    /**
     * Creates a drop down select and gets N number of options from it
     * @param message The message from the user to target user and channel
     * @param prompt The embed to send as the prompt
     * @param options The selection options
     * @param values How many values for the user to enter, defaults to one
     * @returns `Promise<string[]>` the user selected value(s)
     */
    getSelect(message: Discord.Message, prompt: Discord.MessageEmbed, options: SelectOption[], values?: number): Promise<string[]>;
    /**
     * Creates a message with buttons on it, and returns the first the user clicks
     * @param message The message from the user to target user and channel
     * @param prompt The embed to send as the prompt
     * @param options The button options
     * @returns `Promise<string>` the value of the button the user pressed
     */
    getButton(message: Discord.Message, prompt: Discord.MessageEmbed, options: ButtonOption[]): Promise<string>;
    /**
     * Creates a message with buttons, and allows the user to press multiple buttons
     * @param message The message from the user to target user and channel
     * @param prompt The embed to send as the prompt
     * @param options The button options
     * @returns `Promise<void>`
     */
    getButtonSelect(message: Discord.Message, prompt: Discord.MessageEmbed, options: ButtonSelectOption[]): Promise<void>;
}
export { UtilityManager };
