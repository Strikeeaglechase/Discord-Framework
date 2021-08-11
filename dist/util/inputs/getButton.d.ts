import FrameworkClient, { MessageChannel } from "../../app.js";
import Discord from "discord.js";
interface ButtonOption {
    name: string;
    emoji?: string;
    value?: string;
    disabled?: boolean;
    style: "PRIMARY" | "SECONDARY" | "SUCCESS" | "DANGER";
}
declare function getButton(framework: FrameworkClient, channel: MessageChannel, userId: string, prompt: Discord.MessageEmbed, options: ButtonOption[]): Promise<string>;
export { getButton, ButtonOption };
