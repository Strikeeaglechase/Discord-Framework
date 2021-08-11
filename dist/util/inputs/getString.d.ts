import { MessageChannel } from "../../app.js";
import Discord from "discord.js";
declare function getString(channel: MessageChannel, userId: string, prompt: Discord.MessageEmbed): Promise<string>;
export { getString };
