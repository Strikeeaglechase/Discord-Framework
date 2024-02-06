import { config as dotconfig } from "dotenv";
import Framework from "../app.js";
dotconfig();
const opts = {
    commandsPath: `${process.cwd()}/commands/`,
    name: "Framework Test Bot",
    defaultPrefix: ")",
    loggerOpts: {
        logToFile: false
    },
    databaseOpts: {
        databaseName: "frameworkTest",
        url: "mongodb://localhost:27017"
    },
    ownerID: "272143648114606083",
    token: process.env.TOKEN,
};
class App {
    value;
    constructor(v) {
        this.value = v;
    }
}
const framework = new Framework(opts);
async function run() {
    const app = new App(5);
    await framework.init(app);
    await framework.loadBotCommands(`${process.cwd()}/../defaultCommands/`);
}
run();
export { App };
