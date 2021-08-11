import Discord from "discord.js";
import utilDisplayId from "./dispalyID.js";
import { NamedPageEmbed, NumberedPageEmbed } from "./pagedEmbed.js";
import utilParseQuotes from "./parseQuotes.js";
import utilReactConfirm from "./reactConfirm.js";
import utilResolveUser from "./resolveUser.js";
import { getString } from "./inputs/getString.js";
import { getDropdown } from "./inputs/getDropdown.js";
import { getButton } from "./inputs/getButton.js";
import { ObjectBuilder } from "./objectBuilder.js";
import { getButtonSelect } from "./buttonSelects.js";
class UtilityManager {
    constructor(framework) {
        this.framework = framework;
    }
    displayId(id, guild, opts) {
        return utilDisplayId(this.framework.client, guild, id, opts);
    }
    objectBuilder(display, message, questions) {
        return new ObjectBuilder(this.framework, display, message, questions);
    }
    parseQuotes(str) {
        return utilParseQuotes(str);
    }
    reactConfirm(prompt, messageOrChannel, userIdOrOpts, opts) {
        // console.log(prompt, messageOrChannel, userIdOrOpts, opts);
        if (messageOrChannel instanceof Discord.Message && (typeof userIdOrOpts == "object" || typeof userIdOrOpts == "undefined")) {
            return utilReactConfirm(prompt, messageOrChannel.channel, messageOrChannel.author.id, userIdOrOpts);
        }
        else if (!(messageOrChannel instanceof Discord.Message) && typeof userIdOrOpts == "string") {
            return utilReactConfirm(prompt, messageOrChannel, userIdOrOpts, opts);
        }
        else {
            throw new Error(`Invalid argument list given to reactConfirm`);
        }
    }
    resolveUser(resolvable, guild) {
        return utilResolveUser(this.framework, resolvable, guild);
    }
    namedPageEmbed(message, base, init, pages) {
        return new NamedPageEmbed(this.framework, message.channel, message.author.id, base, init, pages);
    }
    numberPageEmbed(message, base, init, pages) {
        return new NumberedPageEmbed(this.framework, message.channel, message.author.id, base, init, pages);
    }
    getString(message, prompt) {
        return getString(message.channel, message.author.id, prompt);
    }
    getSelect(message, prompt, options, values = 1) {
        return getDropdown(this.framework, message.channel, message.author.id, prompt, options, values);
    }
    getButton(message, prompt, options) {
        return getButton(this.framework, message.channel, message.author.id, prompt, options);
    }
    getButtonSelect(message, prompt, options) {
        return getButtonSelect(this.framework, message.channel, message.author.id, prompt, options);
    }
}
export { UtilityManager };
