import { Command } from "../../../../command.js";
class B extends Command {
    name = "b";
    help = {
        msg: "This is a help message",
        usage: "<number>",
    };
    // @CommandRun
    async run(event) {
        return event.framework.success(`SubCmd.Sub.B ran`);
    }
}
export default B;
