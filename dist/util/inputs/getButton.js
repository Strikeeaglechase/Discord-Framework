import Discord from "discord.js";
async function getButton(framework, channel, userId, prompt, options) {
    prompt.setFooter({ text: `You have 5 minutes to select an option.` });
    const requiredRows = Math.ceil(options.length / 5);
    const rows = new Array(requiredRows).fill(null).map(_ => new Discord.ActionRowBuilder());
    options.forEach((option, idx) => {
        const rowIdx = Math.floor(idx / 5);
        rows[rowIdx].addComponents(new Discord.ButtonBuilder({
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
    const prom = new Promise(res => {
        let value = "";
        collector.on("collect", itr => {
            if (!itr.isButton())
                return;
            if (itr.user.id != userId) {
                itr.reply(framework.error(`You cannot select items for a command that was not run by you`, true));
                return;
            }
            value = itr.customId;
            itr.deferUpdate();
            collector.stop();
        });
        collector.on("end", async () => {
            prompt.setFooter({ text: `Response collected` });
            rows.forEach(row => row.components.forEach(comp => comp.setDisabled(true)));
            await message.edit({ embeds: [prompt], components: rows });
            res(value);
        });
    });
    return await prom;
}
export { getButton };
