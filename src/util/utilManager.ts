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
	public parseQuotes(str: string): string[] {
		return utilParseQuotes(str);
	}
	reactConfirm(prompt: string, message: Discord.Message, opts?: ConfirmOptions): Promise<boolean>
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
	public resolveUser(resolvable: string, guild?: Discord.Guild) {
		return utilResolveUser(this.framework, resolvable, guild);
	}
	public namedPageEmbed(message: Discord.Message, base: EmbedCallback, init: EmbedCallback, pages: NamedPage[]) {
		return new NamedPageEmbed(this.framework, message.channel, message.author.id, base, init, pages);
	}
	public numberPageEmbed(message: Discord.Message, base: EmbedCallback, init: EmbedCallback, pages: NumberedPage[]) {
		return new NumberedPageEmbed(this.framework, message.channel, message.author.id, base, init, pages);
	}
	public getString(message: Discord.Message, prompt: Discord.MessageEmbed) {
		return getString(message.channel, message.author.id, prompt);
	}
	public getSelect(message: Discord.Message, prompt: Discord.MessageEmbed, options: SelectOption[], values: number = 1) {
		return getDropdown(this.framework, message.channel, message.author.id, prompt, options, values);
	}
	public getButton(message: Discord.Message, prompt: Discord.MessageEmbed, options: ButtonOption[]) {
		return getButton(this.framework, message.channel, message.author.id, prompt, options);
	}
	public getButtonSelect(message: Discord.Message, prompt: Discord.MessageEmbed, options: ButtonSelectOption[]) {
		return getButtonSelect(this.framework, message.channel, message.author.id, prompt, options);
	}
}
export { UtilityManager }