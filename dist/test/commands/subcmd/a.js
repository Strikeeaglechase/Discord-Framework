var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Command } from "../../../command.js";
class A extends Command {
    constructor() {
        super(...arguments);
        this.name = "a";
        this.help = {
            msg: "This is a help message",
            usage: "<number>",
        };
    }
    // @CommandRun
    run(event) {
        return __awaiter(this, void 0, void 0, function* () {
            return event.framework.success(`SubCmd.A ran`);
        });
    }
}
export default A;
