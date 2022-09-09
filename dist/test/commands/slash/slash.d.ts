import Discord from "discord.js";
import { SlashCommand, SlashCommandEvent } from "../../../command.js";
declare class Slash extends SlashCommand {
    name: string;
    help: {
        msg: string;
        usage: string;
    };
    slashCommand: boolean;
    run(event: SlashCommandEvent): Promise<{
        embeds: Discord.MessageEmbed[];
        ephemeral: boolean;
    }>;
}
export default Slash;
