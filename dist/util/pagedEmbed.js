import Discord, { ButtonStyle } from "discord.js";
class PagedEmbed {
    framework;
    channel;
    userId;
    base;
    init;
    message;
    curEmbed;
    firstReply;
    constructor(framework, channel, userId, base, init) {
        this.framework = framework;
        this.channel = channel;
        this.userId = userId;
        this.base = base;
        this.init = init;
    }
    async start() {
        this.curEmbed = await this.init();
        const emb = await this.base();
        const comps = await this.getComps();
        this.message = await this.channel.send({
            embeds: [emb],
            components: comps
        });
        const collector = this.message.createMessageComponentCollector({
            time: 5 * 60 * 1000
        });
        collector.on("collect", async (c) => {
            if (c.user.id != this.userId) {
                c.reply(this.framework.error("This embed was not created by you. Run the command ", true));
                return;
            }
            if (!this.firstReply) {
                this.firstReply = c;
                await c.reply({ embeds: [this.curEmbed], ephemeral: true });
            }
            await this.handleCollect(c);
        });
        collector.on("end", async () => {
            comps.forEach(row => row.components.forEach(component => component.setDisabled(true)));
            emb.setFooter({ text: `This embed timed out. Run the command again to get a new one` });
            await this.message.edit({
                embeds: [emb],
                components: comps
            });
        });
    }
    async getComps() {
        return [];
    }
    async handleCollect(interaction) { }
}
class NamedPageEmbed extends PagedEmbed {
    pages;
    constructor(framework, channel, userId, base, init, pages) {
        super(framework, channel, userId, base, init);
        this.pages = pages;
        this.start();
    }
    async handleCollect(interaction) {
        if (!interaction.isStringSelectMenu())
            return;
        if (!interaction.replied)
            await interaction.deferUpdate();
        const value = interaction.values[0];
        const page = this.pages.find(p => p.name == value);
        this.curEmbed = await page.get(this.curEmbed, page.name);
        await this.firstReply.editReply({ embeds: [this.curEmbed] });
    }
    async getComps() {
        const row = new Discord.ActionRowBuilder();
        const select = new Discord.StringSelectMenuBuilder({ customId: "page-select", maxValues: 1, minValues: 1, placeholder: "Select a page" });
        this.pages.forEach(page => {
            select.addOptions({
                label: page.name,
                value: page.name,
                description: page.description,
                emoji: page.emoji
            });
        });
        row.addComponents(select);
        return [row];
    }
}
class NumberedPageEmbed extends PagedEmbed {
    pages;
    index = -1;
    constructor(framework, channel, userId, base, init, pages) {
        super(framework, channel, userId, base, init);
        this.pages = pages;
        this.start();
    }
    async handleCollect(interaction) {
        if (!interaction.isButton())
            return;
        if (!interaction.replied)
            await interaction.deferUpdate();
        switch (interaction.customId) {
            case "back":
                this.index--;
                break;
            case "forward":
                this.index++;
                break;
        }
        this.index = Math.max(0, Math.min(this.pages.length - 1, this.index));
        this.curEmbed = await this.pages[this.index](this.curEmbed, this.index);
        this.curEmbed.setFooter({ text: `Page ${this.index + 1} of ${this.pages.length}` });
        await this.firstReply.editReply({ embeds: [this.curEmbed] });
    }
    async getComps() {
        const row = new Discord.ActionRowBuilder();
        const back = new Discord.ButtonBuilder({ customId: "back", style: ButtonStyle.Primary, label: "<" });
        const forward = new Discord.ButtonBuilder({ customId: "forward", style: ButtonStyle.Primary, label: ">" });
        row.addComponents([back, forward]);
        return [row];
    }
}
export { NamedPageEmbed, NumberedPageEmbed };
