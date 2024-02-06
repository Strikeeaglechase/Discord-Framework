import { ButtonInteraction, EmbedBuilder, TextBasedChannel } from "discord.js";
import FrameworkClient from "../app.js";
import { ButtonOption } from "./inputs/getButton.js";
interface ButtonSelectOption {
    button: ButtonOption;
    onSelect: (itr: ButtonInteraction, updateButtons: (options: ButtonSelectOption[]) => Promise<void>) => void | Promise<void>;
}
declare function getButtonSelect(framework: FrameworkClient, channel: TextBasedChannel, userId: string, prompt: EmbedBuilder, options: ButtonSelectOption[]): Promise<void>;
export { getButtonSelect, ButtonSelectOption };
