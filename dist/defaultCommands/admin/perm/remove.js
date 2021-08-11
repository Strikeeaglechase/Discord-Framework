var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Command, UserRole } from "../../../command.js";
import { assert } from "../../../assert.js";
import { PermEvent } from "./perm.js";
import { CommandRun } from "../../../argumentParser.js";
class PermRemove extends Command {
    constructor() {
        super(...arguments);
        this.name = "remove";
        this.help = {
            msg: "Removes permissions from a user",
            usage: "<perm name> <id>"
        };
    }
    run(event, permName, target) {
        return __awaiter(this, void 0, void 0, function* () {
            assert(!Array.isArray(event.perm), `Perms cannot be an array`);
            yield event.framework.utils.reactConfirm(`Are you sure you would like to remove the __${event.perm.name}__ permission from ${target.value.toString()}?`, event.message, {
                onConfirm: () => __awaiter(this, void 0, void 0, function* () {
                    assert(!Array.isArray(event.perm), `Perms cannot be an array`);
                    const ret = yield event.framework.permissions.remove(event.perm.name, target.id);
                    if (ret) {
                        return event.framework.success(`Removed the ${event.perm.name} permission from ${target.value.toString()}`);
                    }
                    else {
                        return event.framework.error(`${target.id} already does not have the \`${event.perm.name}\` permission`);
                    }
                })
            });
        });
    }
}
__decorate([
    CommandRun,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PermEvent, String, UserRole]),
    __metadata("design:returntype", Promise)
], PermRemove.prototype, "run", null);
export default PermRemove;
