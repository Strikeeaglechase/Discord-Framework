import { ClientOptions, ColorResolvable } from "discord.js";
declare module "discord.js" {
    interface Message {
        initTime?: number;
    }
}
type LogLevel = "ERROR" | "WARN" | "INFO";
type LogMessage = string | Error | Object;
interface LoggerOptions {
    logChannels?: Record<LogLevel, string>;
    logToFile: boolean;
    filePath?: string;
}
interface EmbedOptions {
    title?: string;
    desc: string;
    color?: ColorResolvable;
    setTimestamp?: boolean;
}
interface FrameworkClientOptions {
    token: string;
    name: string;
    commandsPath: string;
    defaultPrefix: string;
    databaseOpts: DatabaseOptions;
    loggerOpts?: LoggerOptions;
    ownerID?: string;
    dmPrefixOnPing?: boolean;
    permErrorSilently?: boolean;
    dmErrorSilently?: boolean;
    clientOptions?: ClientOptions;
    slashCommandDevServer?: string;
}
declare const defaultFrameworkOpts: Partial<FrameworkClientOptions>;
interface DatabaseOptions {
    databaseName: string;
    url: string;
}
export { EmbedOptions, FrameworkClientOptions, defaultFrameworkOpts, DatabaseOptions, LoggerOptions, LogMessage, LogLevel };
