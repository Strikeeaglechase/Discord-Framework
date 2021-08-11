var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function getString(channel, userId, prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        prompt.setFooter("You have 5 minutes to reply.");
        const message = yield channel.send({ embeds: [prompt] });
        const collector = channel.createMessageCollector({
            filter: (m) => m.author.id == userId,
            max: 1,
            time: 5 * 1000 * 60
        });
        const prom = new Promise((res) => {
            let value = "";
            collector.on("collect", (m) => {
                value = m.content;
            });
            collector.on("end", () => __awaiter(this, void 0, void 0, function* () {
                prompt.setFooter(`Response collected`);
                yield message.edit({ embeds: [prompt] });
                res(value);
            }));
        });
        return yield prom;
    });
}
export { getString };
