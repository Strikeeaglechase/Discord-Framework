import { SlashCommand, SlashCommandEvent } from "../../../slashCommand.js";
import { NoArgs } from "../../../slashCommandArgumentParser.js";

class PingPong extends SlashCommand {
	name = "pong";
	description = "Replies with pong";

	@NoArgs
	public override async run(event: SlashCommandEvent) {
		return "Pong";
	}
}

export default PingPong;
