import { Command, CommandEvent } from "../../command.js";
declare class Override extends Command {
    name: string;
    help: {
        msg: string;
    };
    run(event: CommandEvent): {
        embeds: import("discord.js").MessageEmbed[];
        ephemeral: boolean;
    };
}
export default Override;
