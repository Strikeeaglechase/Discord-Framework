import { MultiCommand } from "../../../../command.js";
class Sub extends MultiCommand {
    constructor() {
        super(...arguments);
        this.name = "sub";
    }
}
export default Sub;
