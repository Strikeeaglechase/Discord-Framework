// This implements a level based logger that logs data to:
// - stdout
// - a log file split by day
import { Client, Snowflake, TextChannel } from "discord.js";
import fs from "fs";

// - discord channels based off severity
import { LoggerOptions, LogLevel, LogMessage } from "./interfaces";

const path = "./logs/";
const LOG_TIME = 1000;
interface BufferedLogMessage {
	level: LogLevel;
	header: string;
	message: LogMessage;
}
class Logger {
	options: LoggerOptions;
	buffer: BufferedLogMessage[];
	writeStream: fs.WriteStream;
	currentLogFile: string;
	client: Client;
	readyToBotLog: boolean;
	boundLogToBot: () => Promise<void>;
	cb: {
		info: (message: LogMessage) => void;
		warn: (message: LogMessage) => void;
		error: (message: LogMessage) => void;
	};
	constructor(opts: LoggerOptions) {
		this.options = opts;
		this.buffer = [];
		this.readyToBotLog = false;
		this.cb = {
			info: this.info.bind(this),
			warn: this.warn.bind(this),
			error: this.error.bind(this)
		};
		this.boundLogToBot = this.logToBot.bind(this);
		this.boundLogToBot();
	}
	// The logger gets created before the discordJS client is ready, so we have to handle it here not in the constructor
	setClient(client: Client) {
		this.client = client;
		this.readyToBotLog = true;
	}
	// This is a loop that runs once every {LOG_TIME}ms, and is responsible for dumping the past messages into discord
	async logToBot() {
		// If the client is not ready to be used, we just wait
		if (!this.readyToBotLog) {
			return setTimeout(this.boundLogToBot, LOG_TIME);
		}
		// Loop through all buffered messages and organize them by channel
		const channelSorted = {} as Record<string, BufferedLogMessage[]>;
		this.buffer.forEach(message => {
			const channelID = this.options.logChannels[message.level];
			if (channelID) {
				if (!channelSorted[channelID]) channelSorted[channelID] = [];
				channelSorted[channelID].push(message);
			}
		});
		// Loop through each channel and send the messages as a single joined block
		this.buffer = [];
		for (var channelID in channelSorted) {
			const messages = channelSorted[channelID];
			const channel = (await this.client.channels.fetch(channelID as Snowflake)) as TextChannel;
			const msgStrs = messages.map(msg => `\`${msg.header} ${msg.message}\``).join("\n");
			for (let i = 0; i < msgStrs.length; i += 2000) {
				const part = msgStrs.substring(i, Math.min(msgStrs.length, i + 2000));
				await channel.send(part);
			}
		}
		setTimeout(this.boundLogToBot, LOG_TIME);
	}
	// Genorates the [time/date] header all logs have
	getDateHeader() {
		function addZero(n: number): string {
			const str = n.toString();
			return str.length >= 2 ? str.substring(0, 2) : "0" + str;
		}

		function THeader(date: Date): string {
			return `[${addZero(date.getHours())}:${addZero(date.getMinutes())}]`;
		}

		function DHeader(date: Date): string {
			return `[${addZero(date.getDate())}/${addZero(date.getMonth() + 1)}]`;
		}
		const date = new Date();
		const t = DHeader(date) + THeader(date);
		return t;
	}
	// Checks to make sure that the log file exists, then either creates a new log file or opens a write stream to an old one
	checkLogFile() {
		if (!this.options.logToFile) return;
		const curDate = new Date();
		const logName = `${curDate.getMonth() + 1}-${curDate.getDate()}-${curDate.getFullYear()}.txt`;
		const folderPath = this.options.filePath ? this.options.filePath : path;
		if (logName == this.currentLogFile) return;
		if (!fs.existsSync(folderPath)) {
			fs.mkdirSync(folderPath);
		}
		const fullPath = `${folderPath}${logName}`;
		if (!fs.existsSync(fullPath)) {
			fs.writeFileSync(fullPath, "Log created\n");
			console.log(`Created new log file ${fullPath}`);
		} else {
			console.log(`Resuming with old log file ${fullPath}`);
		}
		this.writeStream = fs.createWriteStream(fullPath, {
			flags: "a"
		});
		this.currentLogFile = logName;
	}
	// Base log command
	log(level: LogLevel, message: LogMessage) {
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
		if (this.writeStream) this.writeStream.write(formattedMessage + "\n");
		// If a message given to the logger is not a string, we want to log the raw format of the
		// object as well to prevent Objects such as errors from always appearing as [object Object]
		if (typeof message != "string") {
			// Print out raw message
			console.log(message);
		}
	}
	// Shorthand functions for the log method
	info(message: LogMessage) {
		this.log("INFO", message);
	}
	warn(message: LogMessage) {
		this.log("WARN", message);
	}
	error(message: LogMessage) {
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
