import Discord, { ButtonStyle, TextBasedChannel } from "discord.js";
import FrameworkClient from "../../app.js";
interface ButtonOption {
    name: string;
    emoji?: string;
    value?: string;
    disabled?: boolean;
    style: ButtonStyle.Primary | ButtonStyle.Secondary | ButtonStyle.Success | ButtonStyle.Danger;
}
declare function getButton(framework: FrameworkClient, channel: TextBasedChannel, userId: string, prompt: Discord.EmbedBuilder, options: ButtonOption[]): Promise<string>;
export { getButton, ButtonOption };
