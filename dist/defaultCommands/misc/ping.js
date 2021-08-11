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
import { Command } from "../../command.js";
class Ping extends Command {
    constructor() {
        super(...arguments);
        this.name = "ping";
        this.help = {
            msg: "Ping the bot",
        };
    }
    run(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const { message, framework } = event;
            const emb = new Discord.MessageEmbed();
            emb.setTitle("Pong!");
            const pings = {
                Client: Math.abs(message.initTime - message.createdTimestamp),
                Precheck: Date.now() - message.initTime,
                Websocket: Math.round(framework.client.ws.ping),
            };
            const str = Object.getOwnPropertyNames(pings)
                .map((prop) => `${prop}: ${pings[prop]}ms`)
                .join("\n");
            emb.setDescription(str);
            return emb;
        });
    }
}
;
export default Ping;
