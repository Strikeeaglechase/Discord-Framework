import { TextBasedChannel } from "discord.js";

import { SlashCommand, SlashCommandEvent } from "../../../slashCommand.js";
import { SArg } from "../../../slashCommandArgumentParser.js";

class PingData extends SlashCommand {
	name = "data";
	description = "Echos back data you provide";

	public override async run(
		event: SlashCommandEvent,
		@SArg() data: string,
		@SArg() replyTwice: boolean,
		@SArg({ name: "fuck", required: false }) u: TextBasedChannel
	) {
		let result = data;
		if (replyTwice) result += data;

		if (u) {
			await u.send(result);
			await event.interaction.reply({ ephemeral: true, content: `Replied in <#${u.id}>` });
		} else {
			await event.interaction.reply(result);
		}
	}
}

export default PingData;
