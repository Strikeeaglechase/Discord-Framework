var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fs from "fs";
import { Util } from "discord.js";
const path = "./logs/";
const LOG_TIME = 1000;
class Logger {
    constructor(opts) {
        this.options = opts;
        this.buffer = [];
        this.readyToBotLog = false;
        this.cb = {
            info: this.info.bind(this),
            warn: this.warn.bind(this),
            error: this.error.bind(this),
        };
        this.boundLogToBot = this.logToBot.bind(this);
        this.boundLogToBot();
    }
    // The logger gets created before the discordJS client is ready, so we have to handle it here not in the constructor
    setClient(client) {
        this.client = client;
        this.readyToBotLog = true;
    }
    // This is a loop that runs once every {LOG_TIME}ms, and is responsible for dumping the past messages into discord 
    logToBot() {
        return __awaiter(this, void 0, void 0, function* () {
            // If the client is not ready to be used, we just wait
            if (!this.readyToBotLog) {
                return setTimeout(this.boundLogToBot, LOG_TIME);
            }
            // Loop through all buffered messages and orginize them by channel
            const channelSorted = {};
            this.buffer.forEach(message => {
                const channelID = this.options.logChannels[message.level];
                if (channelID) {
                    if (!channelSorted[channelID])
                        channelSorted[channelID] = [];
                    channelSorted[channelID].push(message);
                }
            });
            // Loop through each channel and send the messages as a single joined block
            this.buffer = [];
            for (var channelID in channelSorted) {
                const messages = channelSorted[channelID];
                const channel = yield this.client.channels.fetch(channelID);
                const msgStrs = messages.map(msg => `\`${msg.header} ${msg.message}\``).join("\n");
                const parts = Util.splitMessage(msgStrs);
                for (let part of parts)
                    yield channel.send(part);
            }
            setTimeout(this.boundLogToBot, LOG_TIME);
        });
    }
    // Genorates the [time/date] header all logs have
    getDateHeader() {
        function addZero(n) {
            const str = n.toString();
            return str.length >= 2 ? str.substring(0, 2) : "0" + str;
        }
        function THeader(date) {
            return `[${addZero(date.getHours())}:${addZero(date.getMinutes())}]`;
        }
        function DHeader(date) {
            return `[${addZero(date.getDate())}/${addZero(date.getMonth() + 1)}]`;
        }
        const date = new Date();
        const t = DHeader(date) + THeader(date);
        return t;
    }
    // Checks to make sure that the log file exists, then either creates a new log file or opens a write stream to an old one
    checkLogFile() {
        if (!this.options.logToFile)
            return;
        const curDate = new Date();
        const logName = `${curDate.getMonth() + 1}-${curDate.getDate()}-${curDate.getFullYear()}.txt`;
        const folderPath = this.options.filePath ? this.options.filePath : path;
        if (logName == this.currentLogFile)
            return;
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }
        const fullPath = `${folderPath}${logName}`;
        if (!fs.existsSync(fullPath)) {
            fs.writeFileSync(fullPath, "Log created\n");
            console.log(`Created new log file ${fullPath}`);
        }
        else {
            console.log(`Resuming with old log file ${fullPath}`);
        }
        this.writeStream = fs.createWriteStream(fullPath, {
            flags: "a",
        });
        this.currentLogFile = logName;
    }
    // Base log command
    log(level, message) {
        this.checkLogFile();
        const header = `[${level}]${this.getDateHeader()}`;
        const formattedMessage = `${header} ${message}`;
        if (this.options.logChannels) {
            this.buffer.push({
                level: level,
                message: message,
                header: header
            });
        }
        console.log(formattedMessage);
        if (this.writeStream)
            this.writeStream.write(formattedMessage + "\n");
        // If a message given to the logger is not a string, we want to log the raw format of the 
        // object as well to prevent Objects such as errors from always appearing as [object Object]
        if (typeof message != "string") {
            // Print out raw message
            console.log(message);
        }
    }
    // Shorthand functions for the log method
    info(message) {
        this.log("INFO", message);
    }
    warn(message) {
        this.log("WARN", message);
    }
    error(message) {
        this.log("ERROR", message);
    }
}
// const test = new Logger({
// 	logToFile: false
// });
// function runTest() {
// 	exec(test.cb.info);
// }
// function exec(cb) {
// 	cb("Fuck");
// }
// runTest();
export default Logger;
