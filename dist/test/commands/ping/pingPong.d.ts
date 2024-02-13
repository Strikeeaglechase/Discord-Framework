import { SlashCommand, SlashCommandEvent } from "../../../slashCommand.js";
declare class PingPong extends SlashCommand {
    name: string;
    description: string;
    run(event: SlashCommandEvent): Promise<string>;
}
export default PingPong;
