var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CommandEvent, MultiCommand } from "../../../command.js";
class PermEvent extends CommandEvent {
    constructor(event, perm) {
        super(event);
        this.perm = perm;
    }
}
class Perm extends MultiCommand {
    constructor() {
        super(...arguments);
        this.name = "perm";
    }
    check(event) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const perm = yield event.framework.permissions.getPermission((_a = event.args[2]) === null || _a === void 0 ? void 0 : _a.toLowerCase());
            const newEvnt = new PermEvent(event, perm);
            return {
                event: newEvnt,
                pass: !(Array.isArray(perm) && event.args[1] != "list"),
                failMessage: event.framework.error(`${event.args[2]} is not a valid permission name. Options are: \n\`\`\`\n${event.framework.permissions.permNames.join("\n")}\n\`\`\``)
            };
        });
    }
}
export default Perm;
export { PermEvent };
