import Discord from "discord.js";

import FrameworkClient, { MessageChannel } from "../app.js";
import utilDisplayId, { DisplayIdOpts } from "./dispalyID.js";
import { EmbedCallback, NamedPageEmbed, NamedPage, NumberedPage, NumberedPageEmbed } from "./pagedEmbed.js";
import utilParseQuotes from "./parseQuotes.js";
import utilReactConfirm, { ConfirmOptions } from "./reactConfirm.js";
import utilResolveUser from "./resolveUser.js";
import { getString } from "./inputs/getString.js";
import { getDropdown, SelectOption } from "./inputs/getDropdown.js";
import { ButtonOption, getButton } from "./inputs/getButton.js";
import { DisplayFunc, ObjectBuilder, Question } from "./objectBuilder.js";
import { ButtonSelectOption, getButtonSelect } from "./buttonSelects.js";

class UtilityManager {
	constructor(private framework: FrameworkClient) { }
	public displayId(id: string, guild?: Discord.Guild, opts?: DisplayIdOpts) {
		return utilDisplayId(this.framework.client, guild, id, opts);
	}
	public objectBuilder<Obj>(display: DisplayFunc, message: Discord.Message, questions: Question[]) {
		return new ObjectBuilder<Obj>(this.framework, display, message, questions)
	}

	/**
	 * Takes in a string, and splits the string into parts based off spaces and grouped by quotes.
	 * @param str The string to parse
	 * @returns string[] of the parsed string
	 */
	public parseQuotes(str: string): string[] {
		return utilParseQuotes(str);
	}

	/**
	 * Create an embed asking the user to confirm something.
	 * @param prompt The prompt to display
	 * @param message The message object to use
	 * @param opts Additional options.
	 */
	reactConfirm(prompt: string, message: Discord.Message, opts?: ConfirmOptions): Promise<boolean>

	/**
	 * Create an embed asking the user to confirm something.
	 * @param prompt The prompt to display
	 * @param channel The channel to send the message to
	 * @param userId The user to listen to
	 * @param opts Additional options.
	 */
	reactConfirm(prompt: string, channel: MessageChannel, userId: string, opts?: ConfirmOptions): Promise<boolean>
	public reactConfirm(prompt: string, messageOrChannel: MessageChannel | Discord.Message, userIdOrOpts: string | ConfirmOptions, opts?: ConfirmOptions): Promise<boolean> {
		// console.log(prompt, messageOrChannel, userIdOrOpts, opts);
		if (messageOrChannel instanceof Discord.Message && (typeof userIdOrOpts == "object" || typeof userIdOrOpts == "undefined")) {
			return utilReactConfirm(prompt, messageOrChannel.channel, messageOrChannel.author.id, userIdOrOpts);
		} else if (!(messageOrChannel instanceof Discord.Message) && typeof userIdOrOpts == "string") {
			return utilReactConfirm(prompt, messageOrChannel, userIdOrOpts, opts);
		} else {
			throw new Error(`Invalid argument list given to reactConfirm`);
		}
	}

	/**
	 * Attemptes to resolve a Discord.User from a string, by id, name, and nickname
	 * @param resolvable String to try to resolve to a user
	 * @param guild Optional to help with the resolotion
	 * @returns `Promise<Discord.User>` if found, otherwise null
	 */
	public resolveUser(resolvable: string, guild?: Discord.Guild) {
		return utilResolveUser(this.framework, resolvable, guild);
	}

	/**
	 * Create a paged embed. This one uses string indexs selected by the user.
	 * @param message object reference sent with the command
	 * @param base This is the message first sent, where either the controls for moving backwards and forwards are created, or the selection for the named pages is added
	 * @param init Creates the initial emebed for the page after an interaction
	 * @param pages Array of pages the user can select
	 * @returns `NamedPageEmbed`
	 */
	public namedPageEmbed(message: Discord.Message, base: EmbedCallback, init: EmbedCallback, pages: NamedPage[]) {
		return new NamedPageEmbed(this.framework, message.channel, message.author.id, base, init, pages);
	}

	/**
	 * Create a paged embed. This one uses sequential numeric indexs selected by the user.
	 * @param message object reference sent with the command
	 * @param base This is the message first sent, where either the controls for moving backwards and forwards are created, or the selection for the named pages is added
	 * @param init Creates the initial emebed for the page after an interaction
	 * @param pages Array of pages the user can select
	 * @returns `NumberedPageEmbed`
	 */
	public numberPageEmbed(message: Discord.Message, base: EmbedCallback, init: EmbedCallback, pages: NumberedPage[]) {
		return new NumberedPageEmbed(this.framework, message.channel, message.author.id, base, init, pages);
	}

	/**
	 * Gets a single message from the user and returns its content
	 * @param message The message from the user to target user and channel
	 * @param prompt The embed to send as the prompt
	 * @returns `Promise<string>` the user entered value
	 */
	public getString(message: Discord.Message, prompt: Discord.MessageEmbed) {
		return getString(message.channel, message.author.id, prompt);
	}
	/**
	 * Creates a drop down select and gets N number of options from it
	 * @param message The message from the user to target user and channel
	 * @param prompt The embed to send as the prompt
	 * @param options The selection options
	 * @param values How many values for the user to enter, defaults to one
	 * @returns `Promise<string[]>` the user selected value(s)
	 */
	public getSelect(message: Discord.Message, prompt: Discord.MessageEmbed, options: SelectOption[], values: number = 1) {
		return getDropdown(this.framework, message.channel, message.author.id, prompt, options, values);
	}

	/**
	 * Creates a message with buttons on it, and returns the first the user clicks
	 * @param message The message from the user to target user and channel
	 * @param prompt The embed to send as the prompt
	 * @param options The button options
	 * @returns `Promise<string>` the value of the button the user pressed
	 */
	public getButton(message: Discord.Message, prompt: Discord.MessageEmbed, options: ButtonOption[]) {
		return getButton(this.framework, message.channel, message.author.id, prompt, options);
	}

	/**
	 * Creates a message with buttons, and allows the user to press multiple buttons
	 * @param message The message from the user to target user and channel
	 * @param prompt The embed to send as the prompt
	 * @param options The button options
	 * @returns `Promise<void>`
	 */
	public getButtonSelect(message: Discord.Message, prompt: Discord.MessageEmbed, options: ButtonSelectOption[]) {
		return getButtonSelect(this.framework, message.channel, message.author.id, prompt, options);
	}
}
export { UtilityManager }