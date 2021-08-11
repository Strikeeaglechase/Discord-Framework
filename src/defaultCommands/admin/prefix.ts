import { Arg } from "../../argumentParser.js";
import { Command, CommandEvent } from "../../command.js";
class Prefix extends Command {
	allowDM = false;
	name = "prefix";
	help = {
		msg: "Changes the prefix of the bot",
		usage: "[new prefix]",
	};
	async run(event: CommandEvent, @Arg({ regex: /^.$/g }) newPrefix: string) {
		const { framework, message } = event;
		// Check if user is admin
		const isRoot = await framework.permissions.check(message.author.id, "commands.root");
		if (!message.member.permissions.has("ADMINISTRATOR") && !isRoot) return framework.error("Only the admin of the server can change the prefix");
		await framework.config.setKey(message.guild.id, "prefix", newPrefix)
		return framework.success(`Server prefix is now: \`${newPrefix}\``);
	}
};
export default Prefix;
