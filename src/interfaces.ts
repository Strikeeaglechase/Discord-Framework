import { ClientOptions, ColorResolvable, IntentsBitField, Partials } from "discord.js";

// import Discord from "discord.js";
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
}
const f = IntentsBitField.Flags;
const defaultFrameworkOpts: Partial<FrameworkClientOptions> = {
	loggerOpts: {
		logToFile: false
	},
	ownerID: "",
	dmPrefixOnPing: true,
	dmErrorSilently: false,
	permErrorSilently: false,
	clientOptions: {
		intents:
			f.Guilds |
			f.GuildMembers |
			f.GuildModeration |
			f.GuildEmojisAndStickers |
			f.GuildIntegrations |
			f.GuildWebhooks |
			f.GuildInvites |
			f.GuildVoiceStates |
			f.GuildPresences |
			f.GuildMessages |
			f.GuildMessageReactions |
			f.GuildMessageTyping |
			f.DirectMessages |
			f.DirectMessageReactions |
			f.DirectMessages |
			f.DirectMessageReactions |
			f.DirectMessageTyping |
			f.MessageContent |
			f.GuildScheduledEvents |
			f.AutoModerationConfiguration |
			f.AutoModerationExecution,
		partials: [Partials.Channel]
	}
};

interface DatabaseOptions {
	databaseName: string;
	url: string;
}

export { EmbedOptions, FrameworkClientOptions, defaultFrameworkOpts, DatabaseOptions, LoggerOptions, LogMessage, LogLevel };
