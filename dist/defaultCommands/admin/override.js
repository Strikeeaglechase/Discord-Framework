import { Command } from "../../command.js";
class Override extends Command {
    name = "override";
    help = {
        msg: "Toggles override for your user",
    };
    run(event) {
        if (event.framework.overrides.includes(event.message.author.id)) {
            event.framework.overrides = event.framework.overrides.filter(id => id != event.message.author.id);
            return event.framework.success("Override disabled");
        }
        else {
            event.framework.overrides.push(event.message.author.id);
            return event.framework.success("Override enabled");
        }
    }
}
export default Override;
