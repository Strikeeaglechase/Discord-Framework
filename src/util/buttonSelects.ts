import { ButtonInteraction, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import FrameworkClient, { MessageChannel } from "../app.js";
import { ButtonOption } from "./inputs/getButton.js";
interface ButtonSelectOption {
	button: ButtonOption;
	onSelect: (itr: ButtonInteraction, updateButtons: (options: ButtonSelectOption[]) => Promise<void>) => void | Promise<void>;
}
function getRows(options: ButtonSelectOption[]) {
	const requiredRows = Math.ceil(options.length / 5);
	const rows = new Array(requiredRows).fill(null).map(_ => new MessageActionRow());

	options.forEach((option, idx) => {
		const rowIdx = Math.floor(idx / 5);
		rows[rowIdx].addComponents(new MessageButton({
			customId: option.button.value !== undefined ? option.button.value : option.button.name,
			label: option.button.name,
			emoji: option.button.emoji,
			style: option.button.style,
			disabled: option.button.disabled
		}));
	});

	return rows;
}

async function getButtonSelect(framework: FrameworkClient, channel: MessageChannel, userId: string, prompt: MessageEmbed, options: ButtonSelectOption[]) {
	const rows = getRows(options);
	const message = await channel.send({ embeds: [prompt], components: rows });

	async function updateButtons(options: ButtonSelectOption[]) {
		await message.edit({ components: getRows(options) });
	}

	const collector = message.createMessageComponentCollector({
		time: 5 * 1000 * 60
	});

	collector.on("collect", async (itr) => {
		if (!itr.isButton()) return;
		if (itr.user.id != userId) return itr.reply(framework.error(`You cannot select items for a command that was not run by you`, true));

		const selected = options.find(o => o.button.value == itr.customId || o.button.name == itr.customId);
		await selected.onSelect(itr, updateButtons);
	});

	collector.on("end", async () => {
		rows.forEach(row => row.components.forEach(comp => comp.setDisabled(true)));
		await message.edit({ embeds: [prompt], components: rows });
	});
}
export { getButtonSelect, ButtonSelectOption };