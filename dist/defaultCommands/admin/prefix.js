var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
import { Arg } from "../../argumentParser.js";
import { Command, CommandEvent } from "../../command.js";
class Prefix extends Command {
    constructor() {
        super(...arguments);
        this.allowDM = false;
        this.name = "prefix";
        this.help = {
            msg: "Changes the prefix of the bot",
            usage: "[new prefix]",
        };
    }
    run(event, newPrefix) {
        return __awaiter(this, void 0, void 0, function* () {
            const { framework, message } = event;
            // Check if user is admin
            const isRoot = yield framework.permissions.check(message.author.id, "commands.root");
            if (!message.member.permissions.has("ADMINISTRATOR") && !isRoot)
                return framework.error("Only the admin of the server can change the prefix");
            yield framework.config.setKey(message.guild.id, "prefix", newPrefix);
            return framework.success(`Server prefix is now: \`${newPrefix}\``);
        });
    }
}
__decorate([
    __param(1, Arg({ regex: /^.$/g })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CommandEvent, String]),
    __metadata("design:returntype", Promise)
], Prefix.prototype, "run", null);
;
export default Prefix;
