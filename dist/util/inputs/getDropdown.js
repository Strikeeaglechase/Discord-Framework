import Discord from "discord.js";
async function getDropdown(framework, channel, userId, prompt, options, values = 1) {
    const endStr = values > 1 ? `${values} options.` : "an option";
    prompt.setFooter({ text: `You have 5 minutes to select ${endStr}` });
    const row = new Discord.ActionRowBuilder();
    const select = new Discord.StringSelectMenuBuilder({ customId: "get-select", maxValues: values, minValues: values, placeholder: "Select an option" });
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
    const prom = new Promise(res => {
        let value = [];
        collector.on("collect", itr => {
            if (!itr.isSelectMenu())
                return;
            if (itr.user.id != userId) {
                itr.reply(framework.error(`You cannot select items for a command that was not run by you`, true));
                return;
            }
            value = itr.values;
            itr.deferUpdate();
            collector.stop();
        });
        collector.on("end", async () => {
            prompt.setFooter({ text: `Response collected` });
            row.components.forEach(comp => comp.setDisabled(true));
            await message.edit({ embeds: [prompt], components: [row] });
            res(value);
        });
    });
    return await prom;
}
export { getDropdown };
