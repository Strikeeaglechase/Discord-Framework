import Discord from "discord.js";
import { Command, CommandEvent } from "../../command.js";
type UserFunctionReturn = string | Object;
type UserFunctionCall = (message: Discord.Message) => UserFunctionReturn;
type UserFunctionGen = () => UserFunctionCall;
class Eval extends Command {
	name = "eval";
	help = {
		msg: "Executes some Javascript code",
	};
	async run(event: CommandEvent) {
		if (event.message.author.id != event.framework.options.ownerID) return;
		// Split message up by lines, remove the first and last
		const lines = event.message.content.split("\n");
		lines.shift();
		lines.pop();
		const code = lines.join("\n");
		const functionGenCode = `async function func(message){${code}}\nreturn func;`;
		let functionGen: UserFunctionGen;
		try {
			// Try to create a new function based off the users code
			functionGen = new Function(functionGenCode) as UserFunctionGen;
		} catch (e) {
			return event.framework.error(`Could not create function\n\`\`\`\n${e.message}\n\`\`\``);
		}
		// Get the users function
		const userFunction = functionGen();
		try {
			const start = Date.now();
			// Execute user function
			const ret: UserFunctionReturn = await userFunction.call(event.framework, event.message);
			let returnStr = `\`\`\`diff\n+ Evaluated in ${Date.now() - start
				}ms\n\`\`\`\n`;
			if (ret) {
				if (typeof ret == "string") {
					returnStr += "```\n" + ret + "\n```";
				} else {
					try {
						returnStr += "```json\n" + JSON.stringify(ret) + "\n```";
					} catch (e) {
						returnStr += "```\n" + ret + "\n```";
					}
				}
			}
			return returnStr;
		} catch (e) {
			return event.framework.error(`Could could not execute\n\`\`\`\n${e.message}\n\`\`\``)
		}
	}
};
export default Eval;
