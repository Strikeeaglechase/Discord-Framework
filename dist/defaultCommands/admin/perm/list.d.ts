import { EmbedBuilder } from "discord.js";
import { Command } from "../../../command.js";
import { PermEvent } from "./perm.js";
declare class PermList extends Command {
    name: string;
    help: {
        msg: string;
        usage: string;
    };
    run(event: PermEvent): Promise<EmbedBuilder>;
}
export default PermList;
