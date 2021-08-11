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
import Discord from "discord.js";
class Test extends Command {
    constructor() {
        super(...arguments);
        this.name = "test";
        this.help = {
            msg: "This is a help message",
            usage: "<number>",
        };
    }
    // @CommandRun
    run(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = [
                { button: { name: "Hello", style: "PRIMARY" }, onSelect: (itr) => { itr.reply(itr.customId); } },
                { button: { name: "World", style: "PRIMARY" }, onSelect: (itr, edit) => { itr.reply(itr.customId); options[1].button.disabled = true; edit(options); } },
                { button: { name: "Test", style: "DANGER" }, onSelect: (itr) => { itr.reply(itr.customId); } }
            ];
            event.framework.utils.getButtonSelect(event.message, new Discord.MessageEmbed({ title: "Hello World" }), options);
        });
    }
}
export default Test;
