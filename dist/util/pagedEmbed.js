var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Discord from "discord.js";
class PagedEmbed {
    constructor(framework, channel, userId, base, init) {
        this.framework = framework;
        this.channel = channel;
        this.userId = userId;
        this.base = base;
        this.init = init;
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.curEmbed = yield this.init();
            const emb = yield this.base();
            const comps = yield this.getComps();
            this.message = yield this.channel.send({
                embeds: [emb],
                components: comps
            });
            const collector = this.message.createMessageComponentCollector({
                time: 5 * 60 * 1000
            });
            collector.on("collect", (c) => __awaiter(this, void 0, void 0, function* () {
                if (c.user.id != this.userId) {
                    c.reply(this.framework.error("This embed was not created by you. Run the command ", true));
                    return;
                }
                if (!this.firstReply) {
                    this.firstReply = c;
                    yield c.reply({ embeds: [this.curEmbed], ephemeral: true });
                }
                yield this.handleCollect(c);
            }));
            collector.on("end", () => __awaiter(this, void 0, void 0, function* () {
                comps.forEach(row => row.components.forEach(component => component.setDisabled(true)));
                emb.setFooter(`This embed timed out. Run the command again to get a new one`);
                yield this.message.edit({
                    embeds: [emb],
                    components: comps
                });
            }));
        });
    }
    getComps() {
        return __awaiter(this, void 0, void 0, function* () {
            return [];
        });
    }
    handleCollect(interaction) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
}
class NamedPageEmbed extends PagedEmbed {
    constructor(framework, channel, userId, base, init, pages) {
        super(framework, channel, userId, base, init);
        this.pages = pages;
        this.start();
    }
    handleCollect(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!interaction.isSelectMenu())
                return;
            if (!interaction.replied)
                yield interaction.deferUpdate();
            const value = interaction.values[0];
            const page = this.pages.find(p => p.name == value);
            this.curEmbed = yield page.get(this.curEmbed, page.name);
            yield this.firstReply.editReply({ embeds: [this.curEmbed] });
        });
    }
    getComps() {
        return __awaiter(this, void 0, void 0, function* () {
            const row = new Discord.MessageActionRow();
            const select = new Discord.MessageSelectMenu({ customId: "page-select", maxValues: 1, minValues: 1, placeholder: "Select a page" });
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
        });
    }
}
class NumberedPageEmbed extends PagedEmbed {
    constructor(framework, channel, userId, base, init, pages) {
        super(framework, channel, userId, base, init);
        this.pages = pages;
        this.index = -1;
        this.start();
    }
    handleCollect(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!interaction.isButton())
                return;
            if (!interaction.replied)
                yield interaction.deferUpdate();
            switch (interaction.customId) {
                case "back":
                    this.index--;
                    break;
                case "forward":
                    this.index++;
                    break;
            }
            this.index = Math.max(0, Math.min(this.pages.length - 1, this.index));
            this.curEmbed = yield this.pages[this.index](this.curEmbed, this.index);
            this.curEmbed.setFooter(`Page ${this.index + 1} of ${this.pages.length}`);
            yield this.firstReply.editReply({ embeds: [this.curEmbed] });
        });
    }
    getComps() {
        return __awaiter(this, void 0, void 0, function* () {
            const row = new Discord.MessageActionRow();
            const back = new Discord.MessageButton({ customId: "back", style: "PRIMARY", label: "<" });
            const forward = new Discord.MessageButton({ customId: "forward", style: "PRIMARY", label: ">" });
            row.addComponents([back, forward]);
            return [row];
        });
    }
}
export { NamedPageEmbed, NumberedPageEmbed };
