import { ClientOptions, ColorResolvable, Intents, IntentsString } from "discord.js";
// import Discord from "discord.js";
declare module 'discord.js' {
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

	slashCommandReset?: boolean;
	loggerOpts?: LoggerOptions;
	ownerID?: string;
	dmPrefixOnPing?: boolean;
	permErrorSilently?: boolean;
	dmErrorSilently?: boolean;
	clientOptions?: ClientOptions;
}
const defaultFrameworkOpts: Partial<FrameworkClientOptions> = {
	loggerOpts: {
		logToFile: false
	},
	ownerID: "",
	dmPrefixOnPing: true,
	dmErrorSilently: false,
	permErrorSilently: false,
	clientOptions: {
		intents: Object.keys(Intents.FLAGS) as IntentsString[],
		partials: ["CHANNEL"]
	},
}

interface DatabaseOptions {
	databaseName: string;
	url: string;
}

export {
	EmbedOptions,
	FrameworkClientOptions,
	defaultFrameworkOpts,
	DatabaseOptions,
	LoggerOptions,
	LogMessage,
	LogLevel,
}