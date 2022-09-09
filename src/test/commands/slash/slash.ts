import Discord, { CommandInteraction } from "discord.js";
import { SlashCommand, SlashCommandEvent, SlashCommandOption, Sendable } from "../../../command.js";

class Slash extends SlashCommand {
    name = "slash";
    help = {
        msg: "This is a help message",
        usage: "<number>",
    };
    slashCommand = true;
    // slashOptions:SlashCommandOption[] = [
    //     {
    //         name: "user",
    //         description: "The user to test",
    //         type: "USER",
    //     }
    // ]; // this can be left out, default = []

    // Run when the command is called.
    async run(event: SlashCommandEvent) {
        const {framework, interaction} = event;
        return framework.success("This is a success message");
    }

}

export default Slash;