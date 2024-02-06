import Discord from "discord.js";
import { Command, CommandEvent } from "../../command.js";
declare class Eval extends Command {
    name: string;
    help: {
        msg: string;
    };
    run(event: CommandEvent): Promise<string | {
        embeds: Discord.EmbedBuilder[];
        ephemeral: boolean;
    }>;
}
export default Eval;
