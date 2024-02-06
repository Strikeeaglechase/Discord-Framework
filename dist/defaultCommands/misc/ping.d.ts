import Discord from "discord.js";
import { Command, CommandEvent } from "../../command.js";
declare class Ping extends Command {
    name: string;
    help: {
        msg: string;
    };
    run(event: CommandEvent): Promise<Discord.EmbedBuilder>;
}
export default Ping;
