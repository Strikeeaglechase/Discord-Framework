import { MultiCommand } from "../../../command.js";
class SubCmd extends MultiCommand {
    constructor() {
        super(...arguments);
        this.name = "subcmd";
    }
}
export default SubCmd;
