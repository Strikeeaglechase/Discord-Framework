import { IntentsBitField, Partials } from "discord.js";
const f = IntentsBitField.Flags;
const defaultFrameworkOpts = {
    loggerOpts: {
        logToFile: false
    },
    ownerID: "",
    dmPrefixOnPing: true,
    dmErrorSilently: false,
    permErrorSilently: false,
    clientOptions: {
        intents: f.Guilds |
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
export { defaultFrameworkOpts };
