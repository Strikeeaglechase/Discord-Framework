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
import { SlashCommand, SlashCommandEvent } from "../../../slashCommand.js";
import { SArg } from "../../../slashCommandArgumentParser.js";
class PingACTest extends SlashCommand {
    name = "ac";
    description = "Replies with pong";
    async run(event, ac) {
        return ac;
    }
    async handleAutocomplete(event) {
        event.interaction.respond([
            { name: "pong", value: "pong" },
            { name: "ping", value: "ping" }
        ]);
    }
}
__decorate([
    __param(1, SArg({ autocomplete: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SlashCommandEvent, String]),
    __metadata("design:returntype", Promise)
], PingACTest.prototype, "run", null);
export default PingACTest;
