var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
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
    async run(event, permName, target) {
        assert(!Array.isArray(event.perm), `Perms cannot be an array`);
        await event.framework.utils.reactConfirm(`Are you sure you would like to grant the __${event.perm.name}__ permission to ${target.value.toString()}?`, event.message, {
            onConfirm: async () => {
                assert(!Array.isArray(event.perm), `Perms cannot be an array`);
                const ret = await event.framework.permissions.grant(event.perm.name, target.id);
                if (ret) {
                    return event.framework.success(`Granted the ${event.perm.name} permission to ${target.value.toString()}`);
                }
                else {
                    return event.framework.error(`${target.value.toString()} already has the \`${event.perm.name}\` permission`);
                }
            }
        });
    }
}
__decorate([
    CommandRun,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PermEvent, String, UserRole]),
    __metadata("design:returntype", Promise)
], PermGrant.prototype, "run", null);
export default PermGrant;
