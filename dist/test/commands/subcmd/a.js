import { Command } from "../../../command.js";
class A extends Command {
    name = "a";
    help = {
        msg: "This is a help message",
        usage: "<number>",
    };
    // @CommandRun
    async run(event) {
        return event.framework.success(`SubCmd.A ran`);
    }
}
export default A;
