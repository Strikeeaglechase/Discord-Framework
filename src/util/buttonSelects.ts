import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, EmbedBuilder, TextBasedChannel } from "discord.js";

import FrameworkClient from "../app.js";
import { ButtonOption } from "./inputs/getButton.js";

interface ButtonSelectOption {
	button: ButtonOption;
	onSelect: (itr: ButtonInteraction, updateButtons: (options: ButtonSelectOption[]) => Promise<void>) => void | Promise<void>;
}
function getRows(options: ButtonSelectOption[]) {
	const requiredRows = Math.ceil(options.length / 5);
	const rows = new Array(requiredRows).fill(null).map(_ => new ActionRowBuilder<ButtonBuilder>());

	options.forEach((option, idx) => {
		const rowIdx = Math.floor(idx / 5);
		rows[rowIdx].addComponents(
			new ButtonBuilder({
				customId: option.button.value !== undefined ? option.button.value : option.button.name,
				label: option.button.name,
				emoji: option.button.emoji,
				style: option.button.style,
				disabled: option.button.disabled
			})
		);
	});

	return rows;
}

async function getButtonSelect(framework: FrameworkClient, channel: TextBasedChannel, userId: string, prompt: EmbedBuilder, options: ButtonSelectOption[]) {
	const rows = getRows(options);
	const message = await channel.send({ embeds: [prompt], components: rows });

	async function updateButtons(options: ButtonSelectOption[]) {
		await message.edit({ components: getRows(options) });
	}

	const collector = message.createMessageComponentCollector({
		time: 5 * 1000 * 60
	});

	collector.on("collect", async itr => {
		if (!itr.isButton()) return;
		if (itr.user.id != userId) {
			itr.reply(framework.error(`You cannot select items for a command that was not run by you`, true));
			return;
		}

		const selected = options.find(o => o.button.value == itr.customId || o.button.name == itr.customId);
		await selected.onSelect(itr, updateButtons);
	});

	collector.on("end", async () => {
		rows.forEach(row => row.components.forEach(comp => comp.setDisabled(true)));
		await message.edit({ embeds: [prompt], components: rows });
	});
}
export { getButtonSelect, ButtonSelectOption };
