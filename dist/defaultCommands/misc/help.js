import Discord from "discord.js";
// import { Page } from "../../util/pagedEmbed.js";
import { isMultiCommand } from "../../app.js";
import { Command } from "../../command.js";
class Help extends Command {
    name = "help";
    help = {
        msg: "Show this help message"
    };
    async run(event) {
        const { message, framework } = event;
        const prefix = message.guild ? await framework.config.getKey(message.guild.id, "prefix") : framework.options.defaultPrefix;
        const allCommands = new Set();
        const catagories = {};
        async function getAllBotCommands(commands) {
            const proms = commands.map(async (command) => {
                const hasPermission = await framework.checkUserPerm(command, message, true);
                if (!hasPermission)
                    return;
                allCommands.add(command);
                const idx = command.category.indexOf(".", 2);
                const category = command.category.substring(1, idx > -1 ? idx : command.category.length);
                if (!catagories[category])
                    catagories[category] = new Set();
                catagories[category].add(command);
                if (isMultiCommand(command))
                    await getAllBotCommands(command.subCommands.filter(c => c.name != command.name));
            });
            await Promise.all(proms);
        }
        await getAllBotCommands(framework.botCommands);
        const handleNewHelpSelect = (emb, name) => {
            const commands = catagories[name];
            emb.setTitle(`**Help for ${name}**`);
            commands.forEach(command => {
                const idx = command.category.lastIndexOf(".");
                // let prename = command.category.substring(idx + 1, command.category.length);
                const prenames = [];
                let parent = command.parent;
                while (parent) {
                    prenames.push(parent.name);
                    parent = parent.parent;
                }
                let prename = prenames.reverse().join(" ");
                if (!(command.parent && isMultiCommand(command.parent)))
                    prename = "";
                if (prename.length > 0)
                    prename += " ";
                if (!command.help.usage && command.help.msg) {
                    emb.addFields([
                        {
                            name: `${prefix}${prename}${command.name} ${command.help.msg}`,
                            value: `\u200E`
                        }
                    ]);
                }
                else if (command.help.msg) {
                    emb.addFields([
                        {
                            name: `${prefix}${prename}${command.name} ${command.help.usage}`,
                            value: command.help.msg
                        }
                    ]);
                }
            });
            return emb;
        };
        framework.utils.namedPageEmbed(message, () => new Discord.EmbedBuilder({ title: "Help selection", description: "Selected the help section you would like to view" }), () => new Discord.EmbedBuilder({ title: "Loading" }), Object.keys(catagories).map(category => {
            return {
                name: category,
                get: handleNewHelpSelect
            };
        }));
    }
}
export default Help;
