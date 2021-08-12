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
// import { Page } from "../../util/pagedEmbed.js";
import { isMultiCommand } from "../../app.js";
import { Command } from "../../command.js";
class Help extends Command {
    constructor() {
        super(...arguments);
        this.name = "help";
        this.help = {
            msg: "Show this help message",
        };
    }
    run(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const { message, framework } = event;
            const prefix = message.guild ? (yield framework.config.getKey(message.guild.id, "prefix")) : framework.options.defaultPrefix;
            const allCommands = new Set();
            const catagories = {};
            function getAllBotCommands(commands) {
                return __awaiter(this, void 0, void 0, function* () {
                    const proms = commands.map((command) => __awaiter(this, void 0, void 0, function* () {
                        const hasPermission = yield framework.checkUserPerm(command, message, true);
                        if (!hasPermission)
                            return;
                        allCommands.add(command);
                        const idx = command.category.indexOf(".", 2);
                        const category = command.category.substring(1, idx > -1 ? idx : command.category.length);
                        if (!catagories[category])
                            catagories[category] = new Set();
                        catagories[category].add(command);
                        if (isMultiCommand(command))
                            yield getAllBotCommands(command.subCommands.filter(c => c.name != command.name));
                    }));
                    yield Promise.all(proms);
                });
            }
            yield getAllBotCommands(framework.botCommands);
            const handleNewHelpSelect = (emb, name) => {
                const commands = catagories[name];
                emb.setTitle(`**Help for ${name}**`);
                emb.fields = [];
                commands.forEach(command => {
                    const idx = command.category.indexOf(".", 2);
                    let prename = command.category.substring(idx > -1 ? idx + 1 : command.category.length);
                    if (prename.length > 0)
                        prename += " ";
                    if (!command.help.usage) {
                        emb.addField(`${prefix}${prename}${command.name}  ${command.help.msg}`, `\u200E`);
                    }
                    else if (command.help.msg) {
                        emb.addField(`${prefix}${prename}${command.name} ${command.help.usage}`, command.help.msg);
                    }
                });
                return emb;
            };
            framework.utils.namedPageEmbed(message, () => new Discord.MessageEmbed({ title: "Help selection", description: "Selected the help section you would like to view" }), () => new Discord.MessageEmbed({ title: "Loading" }), Object.keys(catagories).map(category => {
                return {
                    name: category,
                    get: handleNewHelpSelect
                };
            }));
        });
    }
}
;
export default Help;
