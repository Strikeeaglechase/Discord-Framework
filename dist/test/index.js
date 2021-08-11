var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Framework from "../app.js";
import { config as dotconfig } from "dotenv";
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
    constructor(v) {
        this.value = v;
    }
}
const framework = new Framework(opts);
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = new App(5);
        yield framework.init(app);
        framework.loadBotCommands(`${process.cwd()}/../defaultCommands/`);
    });
}
run();
export { App };
