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
    constructor(framework) {
        this.tracks = new Map();
        this.paths = new Set();
        this.framework = framework;
    }
    get permNames() {
        return [...this.paths];
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.permissions = yield this.framework.database.collection("permissions-new", false, "name");
            this.framework.log.info(`Permission manager started`);
        });
    }
    loadPerms(permissionNames) {
        return __awaiter(this, void 0, void 0, function* () {
            permissionNames.forEach(name => {
                this.paths.add(name);
            });
        });
    }
    setPublic(name, pub) {
        return __awaiter(this, void 0, void 0, function* () {
            const perm = yield this.getPermission(name);
            perm.public = pub;
            yield this.permissions.update(perm, perm.name);
        });
    }
    grant(name, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const perm = yield this.getPermission(name);
            if (perm.allow.includes(id))
                return false;
            perm.allow.push(id);
            yield this.permissions.update(perm, perm.name);
            return true;
        });
    }
    remove(name, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const perm = yield this.getPermission(name);
            if (!perm.allow.includes(id))
                return false;
            perm.allow = perm.allow.filter(pid => pid != id);
            yield this.permissions.update(perm, perm.name);
            return true;
        });
    }
    getPermission(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const perm = yield this.permissions.get(name);
            if (perm)
                return perm;
            return { name: name, allow: [], public: false };
        });
    }
    getUserRoles(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.tracks.get(userId)) {
                this.tracks.set(userId, new Map());
            }
            const guilds = this.framework.client.guilds.cache;
            const roles = [];
            const proms = guilds.map((guild) => __awaiter(this, void 0, void 0, function* () {
                if (this.tracks.get(userId).get(guild.id))
                    return; // If the guild flag is set, this user isnt in the server
                const member = yield guild.members.fetch(userId).catch(() => { });
                if (member)
                    member.roles.cache.forEach(r => roles.push(r.id));
                else
                    this.tracks.get(userId).set(guild.id, true); // Set guild flag
            }));
            yield Promise.all(proms);
            roles.push(userId);
            return roles;
        });
    }
    clearUserTracks(userId) {
        this.tracks.set(userId, new Map());
    }
    check(userId, chain) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.framework.overrides.some(id => id == userId))
                return true;
            let curChain = "";
            const itemProms = chain.split(".").map(part => {
                curChain += curChain ? "." + part : part;
                return this.getPermission(curChain);
            });
            const items = yield Promise.all(itemProms);
            if (items.some(item => item.public))
                return true; // If there is a public part of the chain, return true	
            const userRoles = yield this.getUserRoles(userId);
            for (let item of items) {
                if (userRoles.some(roleId => item.allow.includes(roleId)))
                    return true;
            }
            return false;
        });
    }
}
export { PermissionManager };
