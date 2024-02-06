import Discord, { ButtonStyle } from "discord.js";
import { Command } from "../../../command.js";
class Test extends Command {
    name = "test";
    help = {
        msg: "This is a help message",
        usage: "<number>"
    };
    // @CommandRun
    async run(event) {
        const options = [
            {
                button: { name: "Hello", style: ButtonStyle.Primary },
                onSelect: itr => {
                    itr.reply(itr.customId);
                }
            },
            {
                button: { name: "World", style: ButtonStyle.Primary },
                onSelect: (itr, edit) => {
                    itr.reply(itr.customId);
                    options[1].button.disabled = true;
                    edit(options);
                }
            },
            {
                button: { name: "Test", style: ButtonStyle.Danger },
                onSelect: itr => {
                    itr.reply(itr.customId);
                }
            }
        ];
        event.framework.utils.getButtonSelect(event.message, new Discord.EmbedBuilder({ title: "Hello World" }), options);
    }
}
export default Test;
