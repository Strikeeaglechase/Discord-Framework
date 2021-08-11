import Discord from "discord.js";
import FrameworkClient from "../app.js";
async function resolveUser(framework: FrameworkClient, resolvable: string, guild?: Discord.Guild): Promise<Discord.User> {
	const byIDInServer = guild.members.cache.get(resolvable as Discord.Snowflake);
	if (byIDInServer) return byIDInServer.user;

	const byID = await framework.client.users.fetch(resolvable as Discord.Snowflake).catch(() => { });
	if (byID) return byID;

	if (guild) {
		const inGuild = await checkGuild(resolvable, guild);
		if (inGuild) return inGuild;
	}
	const guilds = framework.client.guilds.cache.array();
	for (let guild of guilds) {
		const inGuild = await checkGuild(resolvable, guild);
		if (inGuild) return inGuild;
	}
}
async function checkGuild(resolvable: string, guild: Discord.Guild): Promise<Discord.User> {
	const query = resolvable.toLowerCase();
	const members = await guild.members.fetch().catch(() => { });
	if (members) {
		const byNameIs = members.find(memb => memb.user.username.toLowerCase() == query);
		if (byNameIs) return byNameIs.user;

		const byNameStarts = members.find(memb => memb.user.username.toLowerCase().startsWith(query));
		if (byNameStarts) return byNameStarts.user;
	}
}
export default resolveUser;