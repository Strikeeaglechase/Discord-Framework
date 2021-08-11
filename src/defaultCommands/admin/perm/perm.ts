import { PermissionEntry } from "../../../permissions.js";
import { CommandEvent, MultiCommand } from "../../../command.js";
class PermEvent<T = any> extends CommandEvent<T> {
	constructor(event: CommandEvent<T>, public perm: PermissionEntry | PermissionEntry[]) {
		super(event);
	}
}
class Perm extends MultiCommand {
	name = "perm";
	async check(event: CommandEvent) {
		const perm = await event.framework.permissions.getPermission(event.args[2]?.toLowerCase());
		const newEvnt = new PermEvent(event, perm);
		return {
			event: newEvnt,
			pass: !(Array.isArray(perm) && event.args[1] != "list"),
			failMessage: event.framework.error(`${event.args[2]} is not a valid permission name. Options are: \n\`\`\`\n${event.framework.permissions.permNames.join("\n")}\n\`\`\``)
		}
	}
}
export default Perm;
export { PermEvent }