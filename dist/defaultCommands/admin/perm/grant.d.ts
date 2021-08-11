import { Command, UserRole } from "../../../command.js";
import { PermEvent } from "./perm.js";
declare class PermGrant extends Command {
    name: string;
    help: {
        msg: string;
        usage: string;
    };
    run(event: PermEvent, permName: string, target: UserRole): Promise<void>;
}
export default PermGrant;
