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
    /**
     * Takes in a string, and splits the string into parts based off spaces and grouped by quotes.
     * @param str The string to parse
     * @returns string[] of the parsed string
     */
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
    /**
     * Attemptes to resolve a Discord.User from a string, by id, name, and nickname
     * @param resolvable String to try to resolve to a user
     * @param guild Optional to help with the resolotion
     * @returns `Promise<Discord.User>` if found, otherwise null
     */
    resolveUser(resolvable, guild) {
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
    namedPageEmbed(message, base, init, pages) {
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
    numberPageEmbed(message, base, init, pages) {
        return new NumberedPageEmbed(this.framework, message.channel, message.author.id, base, init, pages);
    }
    /**
     * Gets a single message from the user and returns its content
     * @param message The message from the user to target user and channel
     * @param prompt The embed to send as the prompt
     * @returns `Promise<string>` the user entered value
     */
    getString(message, prompt) {
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
    getSelect(message, prompt, options, values = 1) {
        return getDropdown(this.framework, message.channel, message.author.id, prompt, options, values);
    }
    /**
     * Creates a message with buttons on it, and returns the first the user clicks
     * @param message The message from the user to target user and channel
     * @param prompt The embed to send as the prompt
     * @param options The button options
     * @returns `Promise<string>` the value of the button the user pressed
     */
    getButton(message, prompt, options) {
        return getButton(this.framework, message.channel, message.author.id, prompt, options);
    }
    /**
     * Creates a message with buttons, and allows the user to press multiple buttons
     * @param message The message from the user to target user and channel
     * @param prompt The embed to send as the prompt
     * @param options The button options
     * @returns `Promise<void>`
     */
    getButtonSelect(message, prompt, options) {
        return getButtonSelect(this.framework, message.channel, message.author.id, prompt, options);
    }
}
export { UtilityManager };
