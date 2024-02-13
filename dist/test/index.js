import { config as dotconfig } from "dotenv";
import Framework from "../app.js";
import { DynamicMessage, DynamicMessageManager } from "../dynamicMessage.js";
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
    slashCommandDevServer: "647138462444552213",
    token: process.env.TOKEN
};
class App {
    value;
    dynamicMessageManager;
    constructor(v) {
        this.value = v;
    }
}
class TestDynamicMessage extends DynamicMessage {
    async onCreated() {
        console.log(`Created: ${JSON.stringify(this.ref)}`);
    }
    async onTimedUpdate() {
        this.message.edit(`Current time: ${Date.now()}`);
    }
}
const framework = new Framework(opts);
async function run() {
    const app = new App(5);
    await framework.init(app);
    const messageHandler = new DynamicMessageManager(framework, TestDynamicMessage, { timedUpdateInterval: 5000, maxPerGuild: 1 });
    await messageHandler.load();
    app.dynamicMessageManager = messageHandler;
    // await framework.loadBotCommands(`${process.cwd()}/../defaultCommands/`);
}
run();
export { App };
