var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class PermissionManager {
    constructor(framework, permissions) {
        this.framework = framework;
        this.permissionNames = permissions;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.framework.log.info(`Permission manager starting`);
            this.roleCache = {};
            this.permissions = yield this.framework.database.collection("permissions", false, "type");
            const perms = {};
            const inits = this.permissionNames.map((type) => __awaiter(this, void 0, void 0, function* () {
                const newPerm = new Permission(this, type);
                yield newPerm.init();
                perms[type] = newPerm;
            }));
            yield Promise.all(inits);
            this.framework.log.info(`Permission manager loaded with perms: ${this.permissionNames.join(", ")}`);
            this.perms = perms;
        });
    }
    updateRoleCache(userID, serverID, roles) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.roleCache[userID]) {
                yield this.makeCacheEntry(userID);
            }
            let serverEntry = this.roleCache[userID].find(entry => entry.serverID = serverID);
            if (!serverEntry) {
                serverEntry = { serverID: serverID, roles: [] };
                this.roleCache[userID].push(serverEntry);
            }
            serverEntry.roles = roles.map(role => role.id);
        });
    }
    getUserRoles(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.roleCache[id]) {
                yield this.makeCacheEntry(id);
            }
            return this.roleCache[id].map(entry => entry.roles).flat();
        });
    }
    makeCacheEntry(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const guilds = this.framework.client.guilds.cache.array();
            const entries = [];
            const proms = guilds.map((guild) => __awaiter(this, void 0, void 0, function* () {
                const member = yield guild.members.fetch(id).catch(() => { });
                const newEntry = {
                    serverID: guild.id,
                    roles: []
                };
                if (member) {
                    newEntry.roles = member.roles.cache.array().map(role => role.id);
                }
                entries.push(newEntry);
            }));
            yield Promise.all(proms);
            this.roleCache[id] = entries;
        });
    }
    get(permName) {
        if (this.permissionNames.includes(permName)) {
            return this.perms[permName];
        }
        else {
            this.framework.log.error(`Unable to fetch permission ${permName}`);
        }
    }
}
class Permission {
    constructor(manager, name) {
        this.name = name;
        this.manager = manager;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const perm = yield this.manager.permissions.get(this.name);
            if (!perm) {
                // create new
                this.ids = [];
                this.mode = "whitelist";
                this.sync();
            }
            else {
                this.ids = perm.ids;
                this.mode = perm.mode;
            }
        });
    }
    allow(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.has(id)) {
                this.ids.push(id);
                yield this.sync();
            }
            else {
                this.manager.framework.log.info(`Permission ${this.name} already had ${id}, thus no change made`);
            }
        });
    }
    deny(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.has(id)) {
                this.ids = this.ids.filter(inId => inId != id);
                yield this.sync();
            }
            else {
                this.manager.framework.log.info(`Permission ${this.name} did not have ${id}, thus no change made`);
            }
        });
    }
    has(id) {
        return this.ids.includes(id);
    }
    check(userID) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userID == this.manager.framework.options.ownerID)
                return true; // Override to allow creator access to all perms always
            if (this.ids.includes(userID))
                return this.mode == "whitelist"; // If have userID, and mode is whitelist then is valid
            const userRoles = yield this.manager.getUserRoles(userID);
            const hasRoleInIDs = userRoles.some(role => this.ids.includes(role));
            if (hasRoleInIDs) {
                return this.mode == "whitelist";
            }
            return this.mode == "blacklist";
        });
    }
    // Write to DB
    sync() {
        return __awaiter(this, void 0, void 0, function* () {
            const perm = {
                ids: this.ids,
                mode: this.mode,
                name: this.name
            };
            return yield this.manager.permissions.update(perm, this.name);
        });
    }
}
export default PermissionManager;
