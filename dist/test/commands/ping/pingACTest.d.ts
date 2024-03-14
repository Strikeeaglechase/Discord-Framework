import { SlashCommand, SlashCommandAutocompleteEvent, SlashCommandEvent } from "../../../slashCommand.js";
import { App } from "../../index.js";
declare class PingACTest extends SlashCommand {
    name: string;
    description: string;
    run(event: SlashCommandEvent, ac: string): Promise<string>;
    handleAutocomplete(event: SlashCommandAutocompleteEvent<App>): Promise<void>;
}
export default PingACTest;
