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
function getDropdown(framework, channel, userId, prompt, options, values = 1) {
    return __awaiter(this, void 0, void 0, function* () {
        const endStr = values > 1 ? `${values} options.` : "an option";
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
        const message = yield channel.send({ embeds: [prompt], components: [row] });
        const collector = message.createMessageComponentCollector({
            time: 5 * 1000 * 60
        });
        const prom = new Promise((res) => {
            let value = [];
            collector.on("collect", (itr) => {
                if (!itr.isSelectMenu())
                    return;
                if (itr.user.id != userId)
                    return itr.reply(framework.error(`You cannot select items for a command that was not run by you`, true));
                value = itr.values;
                itr.deferUpdate();
                collector.stop();
            });
            collector.on("end", () => __awaiter(this, void 0, void 0, function* () {
                prompt.setFooter(`Response collected`);
                row.components.forEach(comp => comp.setDisabled(true));
                yield message.edit({ embeds: [prompt], components: [row] });
                res(value);
            }));
        });
        return yield prom;
    });
}
export { getDropdown };
