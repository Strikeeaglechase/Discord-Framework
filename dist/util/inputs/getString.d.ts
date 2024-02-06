import Discord, { TextBasedChannel } from "discord.js";
declare function getString(channel: TextBasedChannel, userId: string, prompt: Discord.EmbedBuilder): Promise<string>;
export { getString };
