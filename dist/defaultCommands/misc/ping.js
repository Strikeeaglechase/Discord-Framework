import Discord from "discord.js";
import { Command } from "../../command.js";
class Ping extends Command {
    name = "ping";
    help = {
        msg: "Ping the bot"
    };
    async run(event) {
        const { message, framework } = event;
        const emb = new Discord.EmbedBuilder();
        emb.setTitle("Pong!");
        const pings = {
            Client: Math.abs(message.initTime - message.createdTimestamp),
            Precheck: Date.now() - message.initTime,
            Websocket: Math.round(framework.client.ws.ping)
        };
        const str = Object.getOwnPropertyNames(pings)
            .map(prop => `${prop}: ${pings[prop]}ms`)
            .join("\n");
        emb.setDescription(str);
        return emb;
    }
}
export default Ping;
