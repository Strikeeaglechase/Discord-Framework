import { Command, CommandEvent } from "../../../command.js";
declare class Test extends Command {
    name: string;
    help: {
        msg: string;
        usage: string;
    };
    run(event: CommandEvent): Promise<void>;
}
export default Test;
