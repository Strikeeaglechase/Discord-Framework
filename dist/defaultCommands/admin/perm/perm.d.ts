import { PermissionEntry } from "../../../permissions.js";
import { CommandEvent, MultiCommand } from "../../../command.js";
declare class PermEvent<T = any> extends CommandEvent<T> {
    perm: PermissionEntry | PermissionEntry[];
    constructor(event: CommandEvent<T>, perm: PermissionEntry | PermissionEntry[]);
}
declare class Perm extends MultiCommand {
    name: string;
    check(event: CommandEvent): Promise<{
        event: PermEvent<any>;
        pass: boolean;
        failMessage: {
            embeds: import("discord.js").EmbedBuilder[];
            ephemeral: boolean;
        };
    }>;
}
export default Perm;
export { PermEvent };
