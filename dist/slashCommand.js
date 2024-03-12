import { PermissionsBitField } from "discord.js";
class SlashCommandEvent {
    command;
    app;
    framework;
    interaction;
    constructor(framework, interaction, app, command) {
        this.framework = framework;
        this.interaction = interaction;
        this.app = app;
        this.command = command;
    }
}
class SlashCommandAutocompleteEvent {
    command;
    app;
    framework;
    interaction;
    constructor(framework, interaction, app, command) {
        this.framework = framework;
        this.interaction = interaction;
        this.app = app;
        this.command = command;
    }
}
class SlashCommandParent {
    allowDm = true;
    nsfw = false;
    defaultPermission = PermissionsBitField.Flags.SendMessages;
    _isSubcommand = false;
    _parent;
    _subCommands = [];
}
class SlashCommand extends SlashCommandParent {
    getSubCommands() {
        return [];
    }
    handleAutocomplete(event) {
        throw new Error("Autocomplete not implemented for this command");
    }
}
export { SlashCommand, SlashCommandParent, SlashCommandEvent, SlashCommandAutocompleteEvent };
