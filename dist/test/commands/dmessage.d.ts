import { SlashCommand, SlashCommandEvent } from "../../slashCommand.js";
import { App } from "../index.js";
declare class DMessage extends SlashCommand {
    name: string;
    description: string;
    run({ interaction, app }: SlashCommandEvent<App>): Promise<void>;
}
export default DMessage;
