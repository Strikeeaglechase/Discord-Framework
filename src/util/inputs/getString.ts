import Discord, { TextBasedChannel } from "discord.js";

async function getString(channel: TextBasedChannel, userId: string, prompt: Discord.EmbedBuilder) {
	prompt.setFooter({ text: "You have 5 minutes to reply." });
	const message = await channel.send({ embeds: [prompt] });
	const collector = channel.createMessageCollector({
		filter: m => m.author.id == userId,
		max: 1,
		time: 5 * 1000 * 60
	});
	const prom = new Promise<string>(res => {
		let value = "";
		collector.on("collect", m => {
			value = m.content;
		});
		collector.on("end", async () => {
			prompt.setFooter({ text: `Response collected` });
			await message.edit({ embeds: [prompt] });
			res(value);
		});
	});
	return await prom;
}
export { getString };
