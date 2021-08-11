import { Command, CommandEvent } from "../../command.js";
declare class Help extends Command {
    name: string;
    help: {
        msg: string;
    };
    run(event: CommandEvent): Promise<void>;
}
export default Help;
