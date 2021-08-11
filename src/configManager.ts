import { CollectionManager } from "collectionManager.js";
import Discord from "discord.js";
import FrameworkClient from "./app.js";
interface ConfigItem {
	guildId: string;
	[key: string]: string;
}
class ConfigManager {
	private configDefault: ConfigItem = { guildId: null };
	private configs: CollectionManager<string, ConfigItem>;
	constructor(private framework: FrameworkClient) { }
	async init() {
		this.configs = await this.framework.database.collection<string, ConfigItem>("framework_configs", false, "guildId");
	}
	async addKey(key: string, defaultValue: string) {
		this.configDefault[key] = defaultValue;
		const existingConfigs = await this.configs.get();
		const proms = existingConfigs.map(async config => {
			if (config[key] == undefined) {
				this.framework.log.info(`Config for guild ${config.guildId} did not have key ${key}, adding with default of "${defaultValue}"`);
				config[key] = defaultValue;
				await this.configs.update(config, config.guildId);
			}
		});
		await Promise.all(proms);
	}
	async getKey(guildId: Discord.Snowflake, key: string) {
		const config = await this.configs.get(guildId);
		if (config) {
			return config[key];
		} else {
			const newConfig = await this.onGuildJoin(guildId);
			return newConfig[key];
		}
	}
	async setKey(guildId: Discord.Snowflake, key: string, newValue: string) {
		let config = await this.configs.get(guildId);
		if (!config) {
			config = await this.onGuildJoin(guildId);
		}
		config[key] = newValue;
		await this.configs.update(config, guildId);
	}
	async onGuildJoin(guildId: Discord.Snowflake) {
		const newConfig = { ...this.configDefault };
		newConfig.guildId = guildId;
		await this.configs.add(newConfig);
		return newConfig;
	}
	async onGuildLeave(guildId: Discord.Snowflake) {
		await this.configs.remove(guildId);
	}
}
export { ConfigManager };