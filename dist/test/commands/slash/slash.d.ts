import { Command, CommandEvent, SlashCommandOption } from "../../../command.js";
declare class Slash extends Command {
    name: string;
    help: {
        msg: string;
        usage: string;
    };
    slashCommand: boolean;
    slashOptions: SlashCommandOption[];
    run(event: CommandEvent): Promise<void>;
}
export default Slash;
