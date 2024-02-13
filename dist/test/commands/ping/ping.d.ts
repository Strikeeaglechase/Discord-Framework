import { Constructor, SlashCommand, SlashCommandParent } from "../../../slashCommand.js";
declare class Ping extends SlashCommandParent {
    name: string;
    description: string;
    getSubCommands(): Constructor<SlashCommand>[];
}
export default Ping;
