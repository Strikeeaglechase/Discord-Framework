var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Discord from "discord.js";
const IGNORE = () => { };
const defaultOpts = {
    includeTypePrefix: true,
    includeID: true
};
function displayID(client, guild, idAsString, opts = defaultOpts) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = idAsString;
        const rolePrefix = opts.includeTypePrefix ? "**Role:**" : "";
        const userPrefix = opts.includeTypePrefix ? "**User:**" : "";
        const serverPrefix = opts.includeTypePrefix ? "**Server:**" : "";
        const channelPrefix = opts.includeTypePrefix ? "**Channel:**" : "";
        const unknownPrefix = opts.includeTypePrefix ? "**Unknown:**" : "";
        const posteFix = opts.includeID ? `(${id})` : "";
        function ret(resolve) {
            var _a;
            const inGuild = !(resolve instanceof Discord.User) &&
                !(resolve instanceof Discord.Guild) &&
                guild && ((_a = resolve.guild) === null || _a === void 0 ? void 0 : _a.id) == guild.id;
            if (resolve instanceof Discord.GuildChannel) {
                return inGuild ? `${channelPrefix} <#${id}> ${posteFix}` : `${channelPrefix} ${resolve.name} ${posteFix}`;
            }
            else if (resolve instanceof Discord.Role) {
                return inGuild ? `${rolePrefix} <@&${id}> ${posteFix}` : `${rolePrefix} ${resolve.name} ${posteFix}`;
            }
            else if (resolve instanceof Discord.User) {
                return `${userPrefix} ${resolve.username} ${posteFix}`;
            }
            else if (resolve instanceof Discord.GuildMember) {
                return `${userPrefix} <@${id}> ${posteFix}`;
            }
            else if (resolve instanceof Discord.Guild) {
                return `${serverPrefix} ${guildResolve.name} ${posteFix}`;
            }
        }
        const guildResolve = client.guilds.cache.find((g) => g.id == id);
        if (guildResolve)
            return ret(guildResolve);
        const channel = yield client.channels.fetch(id).catch(IGNORE);
        if (channel)
            return ret(channel);
        const userObj = yield client.users.fetch(id).catch(IGNORE);
        const user = userObj && guild ? yield guild.members.fetch(id).catch(IGNORE) : null;
        if (user)
            return ret(user);
        if (userObj)
            return ret(userObj);
        let role;
        for (const [, checkGuild] of client.guilds.cache) {
            if (!checkGuild)
                continue;
            const r = yield checkGuild.roles.fetch(id).catch(IGNORE);
            if (r) {
                role = r;
                break;
            }
        }
        if (role)
            return ret(role);
        return `${unknownPrefix} ${id}`;
    });
}
export default displayID;
