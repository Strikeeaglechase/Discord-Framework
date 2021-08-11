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
function getButton(framework, channel, userId, prompt, options) {
    return __awaiter(this, void 0, void 0, function* () {
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
        const message = yield channel.send({ embeds: [prompt], components: rows });
        const collector = message.createMessageComponentCollector({
            time: 5 * 1000 * 60
        });
        const prom = new Promise((res) => {
            let value = "";
            collector.on("collect", (itr) => {
                if (!itr.isButton())
                    return;
                if (itr.user.id != userId)
                    return itr.reply(framework.error(`You cannot select items for a command that was not run by you`, true));
                value = itr.customId;
                itr.deferUpdate();
                collector.stop();
            });
            collector.on("end", () => __awaiter(this, void 0, void 0, function* () {
                prompt.setFooter(`Response collected`);
                rows.forEach(row => row.components.forEach(comp => comp.setDisabled(true)));
                yield message.edit({ embeds: [prompt], components: rows });
                res(value);
            }));
        });
        return yield prom;
    });
}
export { getButton };
