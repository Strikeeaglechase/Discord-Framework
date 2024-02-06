class ConfigManager {
    framework;
    configDefault = { guildId: null };
    configs;
    constructor(framework) {
        this.framework = framework;
    }
    async init() {
        this.configs = await this.framework.database.collection("framework_configs", false, "guildId");
    }
    async addKey(key, defaultValue) {
        this.configDefault[key] = defaultValue;
        const existingConfigs = await this.configs.get();
        const proms = existingConfigs.map(async (config) => {
            if (config[key] == undefined) {
                this.framework.log.info(`Config for guild ${config.guildId} did not have key ${key}, adding with default of "${defaultValue}"`);
                config[key] = defaultValue;
                await this.configs.update(config, config.guildId);
            }
        });
        await Promise.all(proms);
    }
    async getKey(guildId, key) {
        const config = await this.configs.get(guildId);
        if (config) {
            return config[key];
        }
        else {
            const newConfig = await this.onGuildJoin(guildId);
            return newConfig[key];
        }
    }
    async setKey(guildId, key, newValue) {
        let config = await this.configs.get(guildId);
        if (!config) {
            config = await this.onGuildJoin(guildId);
        }
        config[key] = newValue;
        await this.configs.update(config, guildId);
    }
    async onGuildJoin(guildId) {
        const newConfig = { ...this.configDefault };
        newConfig.guildId = guildId;
        await this.configs.add(newConfig);
        return newConfig;
    }
    async onGuildLeave(guildId) {
        await this.configs.remove(guildId);
    }
}
export { ConfigManager };
