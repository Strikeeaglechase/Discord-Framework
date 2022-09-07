import Discord, { CommandInteraction } from "discord.js";
import { Command, CommandEvent, SlashCommandOption, Sendable } from "../../../command.js";
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

    // Run when the command is called.
    async run(event: CommandEvent) {
        const {framework, interaction} = event;
        if(!event.interaction.isCommand()) return; // required bc typescript funni
        framework.utils.reactConfirm(
            "test",
            interaction.channel,
            interaction.user.id,
            {
                onConfirm: () => {return this.onConfirm(event);},
                onCancel: () => {return "Cancelled"}
            }
        );


    }

    // A quick onConfirm function to work with the reactConfirm function above.
    async onConfirm(event: CommandEvent):Promise<Sendable> {
        let emb = new Discord.MessageEmbed();
        emb.setTitle("Test");
        return emb 
    }

}

export default Slash;