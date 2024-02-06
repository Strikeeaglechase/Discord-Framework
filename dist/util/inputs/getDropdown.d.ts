import Discord, { TextBasedChannel } from "discord.js";
import FrameworkClient from "../../app.js";
interface SelectOption {
    name: string;
    description?: string;
    emoji?: string;
    value?: string;
}
declare function getDropdown(framework: FrameworkClient, channel: TextBasedChannel, userId: string, prompt: Discord.EmbedBuilder, options: SelectOption[], values?: number): Promise<string[]>;
export { getDropdown, SelectOption };
