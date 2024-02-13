import { TextBasedChannel } from "discord.js";
import { SlashCommand, SlashCommandEvent } from "../../../slashCommand.js";
declare class PingData extends SlashCommand {
    name: string;
    description: string;
    run(event: SlashCommandEvent, data: string, replyTwice: boolean, u: TextBasedChannel): Promise<void>;
}
export default PingData;
