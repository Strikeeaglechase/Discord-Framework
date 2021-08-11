import { Command, CommandEvent, UserRole } from "../../../command.js";

import { CommandRun } from "../../../argumentParser.js";
import Discord from "discord.js";
import { NumberedPage } from "../../../util/pagedEmbed.js";
import { ButtonSelectOption } from "../../../util/buttonSelects.js";

class Test extends Command {
	name = "test";
	help = {
		msg: "This is a help message",
		usage: "<number>",
	};
	// @CommandRun
	async run(event: CommandEvent) {
		const options: ButtonSelectOption[] = [
			{ button: { name: "Hello", style: "PRIMARY" }, onSelect: (itr) => { itr.reply(itr.customId) } },
			{ button: { name: "World", style: "PRIMARY" }, onSelect: (itr, edit) => { itr.reply(itr.customId); options[1].button.disabled = true; edit(options) } },
			{ button: { name: "Test", style: "DANGER" }, onSelect: (itr) => { itr.reply(itr.customId) } }
		];
		event.framework.utils.getButtonSelect(event.message, new Discord.MessageEmbed({ title: "Hello World" }), options);
	}
}
export default Test;