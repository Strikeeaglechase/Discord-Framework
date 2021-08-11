import FrameworkClient, { MessageChannel } from "../../app.js";
import Discord from "discord.js";
interface SelectOption {
    name: string;
    description?: string;
    emoji?: string;
    value?: string;
}
declare function getDropdown(framework: FrameworkClient, channel: MessageChannel, userId: string, prompt: Discord.MessageEmbed, options: SelectOption[], values?: number): Promise<string[]>;
export { getDropdown, SelectOption };
