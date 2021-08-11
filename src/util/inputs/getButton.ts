import FrameworkClient, { MessageChannel } from "../../app.js";
import Discord from "discord.js";
interface ButtonOption {
	name: string;
	emoji?: string;
	value?: string;
	disabled?: boolean;
	style: "PRIMARY" | "SECONDARY" | "SUCCESS" | "DANGER";
}
async function getButton(framework: FrameworkClient, channel: MessageChannel, userId: string, prompt: Discord.MessageEmbed, options: ButtonOption[]) {
	prompt.setFooter(`You have 5 minutes to select an option.`);
	const requiredRows = Math.ceil(options.length / 5);
	const rows = new Array(requiredRows).fill(null).map(_ => new Discord.MessageActionRow());
	options.forEach((option, idx) => {
		const rowIdx = Math.floor(idx / 5);
		rows[rowIdx].addComponents(new Discord.MessageButton({
			customId: option.value !== undefined ? option.value : option.name,
			label: option.name,
			emoji: option.emoji,
			style: option.style,
			disabled: option.disabled
		}));
	});

	const message = await channel.send({ embeds: [prompt], components: rows });
	const collector = message.createMessageComponentCollector({
		time: 5 * 1000 * 60
	});
	const prom = new Promise<string>((res) => {
		let value: string = "";
		collector.on("collect", (itr) => {
			if (!itr.isButton()) return;
			if (itr.user.id != userId) return itr.reply(framework.error(`You cannot select items for a command that was not run by you`, true));
			value = itr.customId;
			itr.deferUpdate();
			collector.stop();
		});
		collector.on("end", async () => {
			prompt.setFooter(`Response collected`);
			rows.forEach(row => row.components.forEach(comp => comp.setDisabled(true)));
			await message.edit({ embeds: [prompt], components: rows });
			res(value);
		});
	});
	return await prom;
}
export { getButton, ButtonOption };