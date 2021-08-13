var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function resolveUser(framework, resolvable, guild) {
    return __awaiter(this, void 0, void 0, function* () {
        const byIDInServer = guild.members.cache.get(resolvable);
        if (byIDInServer)
            return byIDInServer.user;
        const byID = yield framework.client.users.fetch(resolvable).catch(() => { });
        if (byID)
            return byID;
        if (guild) {
            const inGuild = yield checkGuild(resolvable, guild);
            if (inGuild)
                return inGuild;
        }
        for (let guild of framework.client.guilds.cache) {
            const inGuild = yield checkGuild(resolvable, guild[1]);
            if (inGuild)
                return inGuild;
        }
    });
}
function checkGuild(resolvable, guild) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = resolvable.toLowerCase();
        const members = yield guild.members.fetch().catch(() => { });
        if (members) {
            const byNameIs = members.find(memb => memb.user.username.toLowerCase() == query);
            if (byNameIs)
                return byNameIs.user;
            const byNameStarts = members.find(memb => memb.user.username.toLowerCase().startsWith(query));
            if (byNameStarts)
                return byNameStarts.user;
        }
    });
}
export default resolveUser;
