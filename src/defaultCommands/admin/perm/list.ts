import { EmbedBuilder } from "discord.js";

import { Command } from "../../../command.js";
import { PermEvent } from "./perm.js";

class PermList extends Command {
	name = "list";
	help = {
		msg: "Lists all who have access to a specific permission",
		usage: "<perm name> <id>"
	};
	async run(event: PermEvent) {
		if (!Array.isArray(event.perm)) {
			const emb = new EmbedBuilder();
			emb.setTitle(event.perm.name);
			const idProms = event.perm.allow.map(id => event.framework.utils.displayId(id, event.message.guild));
			const ids = await Promise.all(idProms);
			emb.setDescription(ids.join("\n"));
			return emb;
		} else {
			const emb = new EmbedBuilder();
			emb.setTitle("Permissions");
			emb.setDescription(`\`\`\`\n${event.framework.permissions.permNames.join("\n")}\n\`\`\``);
			return emb;
		}
	}
}
export default PermList;
