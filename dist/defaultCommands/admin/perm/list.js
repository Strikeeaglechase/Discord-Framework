var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { MessageEmbed } from "discord.js";
import { Command } from "../../../command.js";
class PermList extends Command {
    constructor() {
        super(...arguments);
        this.name = "list";
        this.help = {
            msg: "Lists all who have access to a specific permission",
            usage: "<perm name> <id>"
        };
    }
    run(event) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!Array.isArray(event.perm)) {
                const emb = new MessageEmbed();
                emb.setTitle(event.perm.name);
                const idProms = event.perm.allow.map(id => event.framework.utils.displayId(id, event.message.guild));
                const ids = yield Promise.all(idProms);
                emb.setDescription(ids.join("\n"));
                return emb;
            }
            else {
                const emb = new MessageEmbed();
                emb.setTitle("Permissions");
                emb.setDescription(`\`\`\`\n${event.framework.permissions.permNames.join("\n")}\n\`\`\``);
                return emb;
            }
        });
    }
}
export default PermList;
