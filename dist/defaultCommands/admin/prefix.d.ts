import { Command, CommandEvent } from "../../command.js";
declare class Prefix extends Command {
    allowDM: boolean;
    name: string;
    help: {
        msg: string;
        usage: string;
    };
    run(event: CommandEvent, newPrefix: string): Promise<{
        embeds: import("discord.js").MessageEmbed[];
        ephemeral: boolean;
    }>;
}
export default Prefix;
