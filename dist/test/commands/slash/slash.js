var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Discord from "discord.js";
import { Command } from "../../../command.js";
class Slash extends Command {
    constructor() {
        super(...arguments);
        this.name = "slash";
        this.help = {
            msg: "This is a help message",
            usage: "<number>",
        };
        this.slashCommand = true;
        this.slashOptions = [
            {
                name: "user",
                description: "The user to test",
                type: "USER",
            }
        ]; // this can be left out, default = []
    }
    // @CommandRu
    run(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const { framework, interaction } = event;
            if (!event.interaction.isCommand())
                return; // required bc typescript funni
            framework.utils.reactConfirm("test", interaction.channel, interaction.user.id, {
                onConfirm: () => { return this.onConfirm(event); },
                onCancel: () => { return "Cancelled"; }
            });
        });
    }
    onConfirm(event) {
        return __awaiter(this, void 0, void 0, function* () {
            let emb = new Discord.MessageEmbed();
            emb.setTitle("Test");
            return emb;
        });
    }
}
export default Slash;
