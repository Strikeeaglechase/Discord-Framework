import { Constructor, SlashCommand, SlashCommandParent } from "../../../slashCommand.js";
import PingACTest from "./pingACTest.js";
import PingData from "./pingData.js";
import PingPong from "./pingPong.js";

class Ping extends SlashCommandParent {
	name = "ping";
	description = "Replies with pong";

	public override getSubCommands(): Constructor<SlashCommand>[] {
		return [PingData, PingPong, PingACTest];
	}
}

export default Ping;
