import { CommandEvent, MultiCommand } from "../../../command.js";
class PermEvent extends CommandEvent {
    perm;
    constructor(event, perm) {
        super(event);
        this.perm = perm;
    }
}
class Perm extends MultiCommand {
    name = "perm";
    async check(event) {
        const perm = await event.framework.permissions.getPermission(event.args[2]?.toLowerCase());
        const newEvnt = new PermEvent(event, perm);
        return {
            event: newEvnt,
            pass: !(Array.isArray(perm) && event.args[1] != "list"),
            failMessage: event.framework.error(`${event.args[2]} is not a valid permission name. Options are: \n\`\`\`\n${event.framework.permissions.permNames.join("\n")}\n\`\`\``)
        };
    }
}
export default Perm;
export { PermEvent };
