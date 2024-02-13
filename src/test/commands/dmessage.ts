import { SlashCommand, SlashCommandEvent } from "../../slashCommand.js";
import { NoArgs } from "../../slashCommandArgumentParser.js";
import { App } from "../index.js";

class DMessage extends SlashCommand {
	name = "dmessage";
	description = "Create a dynamic message";

	@NoArgs
	public override async run({ interaction, app }: SlashCommandEvent<App>): Promise<void> {
		const dmessage = await interaction.channel.send(`Pending dynamic message`);
		interaction.reply({ content: `Dynamic message created: ${dmessage.id}`, ephemeral: true });

		app.dynamicMessageManager.create(dmessage);
	}
}
export default DMessage;
