import { Command, UserRole } from "../../../command.js";
import { assert } from "../../../assert.js";
import { PermEvent } from "./perm.js";
import { CommandRun } from "../../../argumentParser.js";
class PermGrant extends Command {
	name = "grant";
	help = {
		msg: "Grants permissions to a user",
		usage: "<perm name> <id>"
	};
	@CommandRun
	async run(event: PermEvent, permName: string, target: UserRole) {
		assert(!Array.isArray(event.perm), `Perms cannot be an array`);
		await event.framework.utils.reactConfirm(
			`Are you sure you would like to grant the __${event.perm.name}__ permission to ${target.value.toString()}?`,
			event.message,
			{
				onConfirm: async () => {
					assert(!Array.isArray(event.perm), `Perms cannot be an array`);
					const ret = await event.framework.permissions.grant(event.perm.name, target.id);
					if (ret) {
						return event.framework.success(`Granted the ${event.perm.name} permission to ${target.value.toString()}`);
					} else {
						return event.framework.error(`${target.value.toString()} already has the \`${event.perm.name}\` permission`);
					}
				}
			}
		);
	}
}
export default PermGrant;