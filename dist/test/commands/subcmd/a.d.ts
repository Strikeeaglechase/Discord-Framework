import { Command, CommandEvent } from "../../../command.js";
declare class A extends Command {
    name: string;
    help: {
        msg: string;
        usage: string;
    };
    run(event: CommandEvent): Promise<{
        embeds: import("discord.js").EmbedBuilder[];
        ephemeral: boolean;
    }>;
}
export default A;
