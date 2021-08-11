import Discord from "discord.js";
// import { Page } from "../../util/pagedEmbed.js";
import { isMultiCommand } from "../../app.js";
import { BotCommand, Command, CommandEvent } from "../../command.js";
class Help extends Command {
	name = "help";
	help = {
		msg: "Show this help message",
	};
	async run(event: CommandEvent) {
		const { message, framework } = event;
		const prefix = message.guild ? (await framework.config.getKey(message.guild.id, "prefix")) : framework.options.defaultPrefix;
		const allCommands: Set<BotCommand> = new Set();
		const catagories: Record<string, Set<BotCommand>> = {};
		async function getAllBotCommands(commands: BotCommand[]) {
			const proms = commands.map(async command => {
				const hasPermission = await framework.checkUserPerm(command, message, true);
				if (!hasPermission) return;

				allCommands.add(command);

				const idx = command.category.indexOf(".", 2);
				const category = command.category.substring(1, idx > -1 ? idx : command.category.length);
				if (!catagories[category]) catagories[category] = new Set();
				catagories[category].add(command);

				if (isMultiCommand(command)) await getAllBotCommands(command.subCommands.filter(c => c.name != command.name));
			});
			await Promise.all(proms);
		}
		await getAllBotCommands(framework.botCommands);
		const handleNewHelpSelect = (emb: Discord.MessageEmbed, name: string) => {
			const commands = catagories[name];
			emb.setTitle(`**Help for ${name}**`);
			emb.fields = [];
			commands.forEach(command => {
				const idx = command.category.indexOf(".", 2);
				let prename = command.category.substring(idx > -1 ? idx + 1 : command.category.length);
				if (prename.length > 0) prename += " ";
				if (!command.help.usage) {
					emb.addField(`${prefix}${prename}${command.name}  ${command.help.msg}`, `\u200E`);
				} else if (command.help.msg) {
					emb.addField(`${prefix}${prename}${command.name} ${command.help.usage}`, command.help.msg);
				}
			});
			return emb;
		}
		framework.utils.namedPageEmbed(
			message,
			() => new Discord.MessageEmbed({ title: "Help selection", description: "Selected the help section you would like to view" }),
			() => new Discord.MessageEmbed({ title: "Loading" }),
			Object.keys(catagories).map(category => {
				return {
					name: category,
					emoji: framework.options.helpEmojis[category],
					get: handleNewHelpSelect
				}
			})
		);
	}
};
export default Help;
