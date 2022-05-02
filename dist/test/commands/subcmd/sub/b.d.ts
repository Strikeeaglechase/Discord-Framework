import { Command, CommandEvent } from "../../../../command.js";
declare class B extends Command {
    name: string;
    help: {
        msg: string;
        usage: string;
    };
    run(event: CommandEvent): Promise<{
        embeds: import("discord.js").MessageEmbed[];
        ephemeral: boolean;
    }>;
}
export default B;
