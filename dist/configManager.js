var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class ConfigManager {
    constructor(framework) {
        this.framework = framework;
        this.configDefault = { guildId: null };
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.configs = yield this.framework.database.collection("framework_configs", false, "guildId");
        });
    }
    addKey(key, defaultValue) {
        return __awaiter(this, void 0, void 0, function* () {
            this.configDefault[key] = defaultValue;
            const existingConfigs = yield this.configs.get();
            const proms = existingConfigs.map((config) => __awaiter(this, void 0, void 0, function* () {
                if (config[key] == undefined) {
                    this.framework.log.info(`Config for guild ${config.guildId} did not have key ${key}, adding with default of "${defaultValue}"`);
                    config[key] = defaultValue;
                    yield this.configs.update(config, config.guildId);
                }
            }));
            yield Promise.all(proms);
        });
    }
    getKey(guildId, key) {
        return __awaiter(this, void 0, void 0, function* () {
            const config = yield this.configs.get(guildId);
            if (config) {
                return config[key];
            }
            else {
                const newConfig = yield this.onGuildJoin(guildId);
                return newConfig[key];
            }
        });
    }
    setKey(guildId, key, newValue) {
        return __awaiter(this, void 0, void 0, function* () {
            let config = yield this.configs.get(guildId);
            if (!config) {
                config = yield this.onGuildJoin(guildId);
            }
            config[key] = newValue;
            yield this.configs.update(config, guildId);
        });
    }
    onGuildJoin(guildId) {
        return __awaiter(this, void 0, void 0, function* () {
            const newConfig = Object.assign({}, this.configDefault);
            newConfig.guildId = guildId;
            yield this.configs.add(newConfig);
            return newConfig;
        });
    }
    onGuildLeave(guildId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.configs.remove(guildId);
        });
    }
}
export { ConfigManager };
