import FrameworkClient, { MessageChannel } from "../../app.js";
import Discord from "discord.js";
interface SelectOption {
	name: string;
	description?: string;
	emoji?: string;
	value?: string;
}
async function getDropdown(framework: FrameworkClient, channel: MessageChannel, userId: string, prompt: Discord.MessageEmbed, options: SelectOption[], values: number = 1) {
	const endStr = values > 1 ? `${values} options.` : "an option"
	prompt.setFooter(`You have 5 minutes to select ${endStr}`);
	const row = new Discord.MessageActionRow();
	const select = new Discord.MessageSelectMenu({ customId: "get-select", maxValues: values, minValues: values, placeholder: "Select an option" });
	options.forEach(option => {
		select.addOptions({
			label: option.name,
			value: option.value !== undefined ? option.value : option.name,
			description: option.description,
			emoji: option.emoji
		});
	});
	row.addComponents(select);
	const message = await channel.send({ embeds: [prompt], components: [row] });
	const collector = message.createMessageComponentCollector({
		time: 5 * 1000 * 60
	});
	const prom = new Promise<string[]>((res) => {
		let value: string[] = [];
		collector.on("collect", (itr) => {
			if (!itr.isSelectMenu()) return;
			if (itr.user.id != userId) return itr.reply(framework.error(`You cannot select items for a command that was not run by you`, true));
			value = itr.values;
			itr.deferUpdate();
			collector.stop();
		});
		collector.on("end", async () => {
			prompt.setFooter(`Response collected`);
			row.components.forEach(comp => comp.setDisabled(true));
			await message.edit({ embeds: [prompt], components: [row] });
			res(value);
		});
	});
	return await prom;
}
export { getDropdown, SelectOption };