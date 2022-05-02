/// <reference types="node" />
import { Client } from "discord.js";
import fs from "fs";
import { LoggerOptions, LogLevel, LogMessage } from "./interfaces";
interface BufferedLogMessage {
    level: LogLevel;
    header: string;
    message: LogMessage;
}
declare class Logger {
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
    constructor(opts: LoggerOptions);
    setClient(client: Client): void;
    logToBot(): Promise<NodeJS.Timeout>;
    getDateHeader(): string;
    checkLogFile(): void;
    log(level: LogLevel, message: LogMessage): void;
    info(message: LogMessage): void;
    warn(message: LogMessage): void;
    error(message: LogMessage): void;
}
export default Logger;
