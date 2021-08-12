import { Intents } from "discord.js";
const defaultFrameworkOpts = {
    loggerOpts: {
        logToFile: false
    },
    ownerID: "",
    dmPrefixOnPing: true,
    dmErrorSilently: false,
    permErrorSilently: false,
    clientOptions: {
        intents: Object.keys(Intents.FLAGS),
        partials: ["CHANNEL"]
    },
};
export { defaultFrameworkOpts, };
