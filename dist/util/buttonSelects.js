var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { MessageActionRow, MessageButton } from "discord.js";
function getRows(options) {
    const requiredRows = Math.ceil(options.length / 5);
    const rows = new Array(requiredRows).fill(null).map(_ => new MessageActionRow());
    options.forEach((option, idx) => {
        const rowIdx = Math.floor(idx / 5);
        rows[rowIdx].addComponents(new MessageButton({
            customId: option.button.value !== undefined ? option.button.value : option.button.name,
            label: option.button.name,
            emoji: option.button.emoji,
            style: option.button.style,
            disabled: option.button.disabled
        }));
    });
    return rows;
}
function getButtonSelect(framework, channel, userId, prompt, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const rows = getRows(options);
        const message = yield channel.send({ embeds: [prompt], components: rows });
        function updateButtons(options) {
            return __awaiter(this, void 0, void 0, function* () {
                yield message.edit({ components: getRows(options) });
            });
        }
        const collector = message.createMessageComponentCollector({
            time: 5 * 1000 * 60
        });
        collector.on("collect", (itr) => __awaiter(this, void 0, void 0, function* () {
            if (!itr.isButton())
                return;
            if (itr.user.id != userId)
                return itr.reply(framework.error(`You cannot select items for a command that was not run by you`, true));
            const selected = options.find(o => o.button.value == itr.customId || o.button.name == itr.customId);
            yield selected.onSelect(itr, updateButtons);
        }));
        collector.on("end", () => __awaiter(this, void 0, void 0, function* () {
            rows.forEach(row => row.components.forEach(comp => comp.setDisabled(true)));
            yield message.edit({ embeds: [prompt], components: rows });
        }));
    });
}
export { getButtonSelect };
