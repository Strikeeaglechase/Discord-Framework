import { SlashCommand, SlashCommandAutocompleteEvent, SlashCommandEvent } from "../../../slashCommand.js";
import { SArg } from "../../../slashCommandArgumentParser.js";
import { App } from "../../index.js";

class PingACTest extends SlashCommand {
	name = "ac";
	description = "Replies with pong";

	public override async run(event: SlashCommandEvent, @SArg({ autocomplete: true }) ac: string) {
		return ac;
	}

	public override async handleAutocomplete(event: SlashCommandAutocompleteEvent<App>) {
		event.interaction.respond([
			{ name: "pong", value: "pong" },
			{ name: "ping", value: "ping" }
		]);
	}
}

export default PingACTest;
