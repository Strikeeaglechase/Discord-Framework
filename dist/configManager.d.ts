import Discord from "discord.js";
import FrameworkClient from "./app.js";
declare class ConfigManager {
    private framework;
    private configDefault;
    private configs;
    constructor(framework: FrameworkClient);
    init(): Promise<void>;
    addKey(key: string, defaultValue: string): Promise<void>;
    getKey(guildId: Discord.Snowflake, key: string): Promise<string>;
    setKey(guildId: Discord.Snowflake, key: string, newValue: string): Promise<void>;
    onGuildJoin(guildId: Discord.Snowflake): Promise<{
        [x: string]: string;
        guildId: string;
    }>;
    onGuildLeave(guildId: Discord.Snowflake): Promise<void>;
}
export { ConfigManager };
