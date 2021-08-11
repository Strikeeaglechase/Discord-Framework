import { ButtonInteraction, MessageEmbed } from "discord.js";
import FrameworkClient, { MessageChannel } from "../app.js";
import { ButtonOption } from "./inputs/getButton.js";
interface ButtonSelectOption {
    button: ButtonOption;
    onSelect: (itr: ButtonInteraction, updateButtons: (options: ButtonSelectOption[]) => Promise<void>) => void | Promise<void>;
}
declare function getButtonSelect(framework: FrameworkClient, channel: MessageChannel, userId: string, prompt: MessageEmbed, options: ButtonSelectOption[]): Promise<void>;
export { getButtonSelect, ButtonSelectOption };
