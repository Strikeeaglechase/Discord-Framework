import { Command, CommandEvent, SlashCommandOption, Sendable } from "../../../command.js";
declare class Slash extends Command {
    name: string;
    help: {
        msg: string;
        usage: string;
    };
    slashCommand: boolean;
    slashOptions: SlashCommandOption[];
    run(event: CommandEvent): Promise<void>;
    onConfirm(event: CommandEvent): Promise<Sendable>;
}
export default Slash;
