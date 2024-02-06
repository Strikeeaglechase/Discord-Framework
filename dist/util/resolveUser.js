async function resolveUser(framework, resolvable, guild) {
    const byIDInServer = guild.members.cache.get(resolvable);
    if (byIDInServer)
        return byIDInServer.user;
    const byID = await framework.client.users.fetch(resolvable).catch(() => { });
    if (byID)
        return byID;
    if (guild) {
        const inGuild = await checkGuild(resolvable, guild);
        if (inGuild)
            return inGuild;
    }
    for (let guild of framework.client.guilds.cache) {
        const inGuild = await checkGuild(resolvable, guild[1]);
        if (inGuild)
            return inGuild;
    }
}
async function checkGuild(resolvable, guild) {
    const query = resolvable.toLowerCase();
    const members = await guild.members.fetch().catch(() => { });
    if (members) {
        const byNameIs = members.find(memb => memb.user.username.toLowerCase() == query);
        if (byNameIs)
            return byNameIs.user;
        const byNameStarts = members.find(memb => memb.user.username.toLowerCase().startsWith(query));
        if (byNameStarts)
            return byNameStarts.user;
    }
}
export default resolveUser;
