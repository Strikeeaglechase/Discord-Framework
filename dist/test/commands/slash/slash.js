var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { SlashCommand } from "../../../command.js";
class Slash extends SlashCommand {
    constructor() {
        super(...arguments);
        this.name = "slash";
        this.help = {
            msg: "This is a help message",
            usage: "<number>",
        };
        this.slashCommand = true;
    }
    // slashOptions:SlashCommandOption[] = [
    //     {
    //         name: "user",
    //         description: "The user to test",
    //         type: "USER",
    //     }
    // ]; // this can be left out, default = []
    // Run when the command is called.
    run(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const { framework, interaction } = event;
            return framework.success("This is a success message");
        });
    }
}
export default Slash;
