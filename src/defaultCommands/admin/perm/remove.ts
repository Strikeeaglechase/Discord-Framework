import { Command, UserRole } from "../../../command.js";
import { assert } from "../../../assert.js";
import { PermEvent } from "./perm.js";
import { CommandRun } from "../../../argumentParser.js";
class PermRemove extends Command {
	name = "remove";
	help = {
		msg: "Removes permissions from a user",
		usage: "<perm name> <id>"
	};
	@CommandRun
	async run(event: PermEvent, permName: string, target: UserRole) {
		assert(!Array.isArray(event.perm), `Perms cannot be an array`);
		await event.framework.utils.reactConfirm(
			`Are you sure you would like to remove the __${event.perm.name}__ permission from ${target.value.toString()}?`,
			event.message,
			{
				onConfirm: async () => {
					assert(!Array.isArray(event.perm), `Perms cannot be an array`);
					const ret = await event.framework.permissions.remove(event.perm.name, target.id);
					if (ret) {
						return event.framework.success(`Removed the ${event.perm.name} permission from ${target.value.toString()}`);
					} else {
						return event.framework.error(`${target.id} already does not have the \`${event.perm.name}\` permission`);
					}
				}
			}
		);
	}
}
export default PermRemove;