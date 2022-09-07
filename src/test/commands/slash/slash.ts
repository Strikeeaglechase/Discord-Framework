import Discord from "discord.js";

import { Command, CommandEvent, SlashCommandOption } from "../../../command.js";
import { ButtonSelectOption } from "../../../util/buttonSelects.js";

class Slash extends Command {
    name = "slash";
    help = {
        msg: "This is a help message",
        usage: "<number>",
    };
    slashCommand = true;
    slashOptions:SlashCommandOption[] = [
        {
            name: "user",
            description: "The user to test",
            type: "USER",
        }
    ]; // this can be left out, default = []

    // @CommandRu
    async run(event: CommandEvent) {
        if(!event.interaction.isCommand()) return;
        event.interaction.reply('test!')
    }
}

export default Slash;