import Discord from "discord.js";
const IGNORE = () => { };
interface DisplayIdOpts {
	includeTypePrefix: boolean;
	includeID: boolean;
}
const defaultOpts: DisplayIdOpts = {
	includeTypePrefix: true,
	includeID: true
}
async function displayID(client: Discord.Client, guild: Discord.Guild, idAsString: string, opts: DisplayIdOpts = defaultOpts): Promise<string> {
	const id = idAsString as Discord.Snowflake;
	const rolePrefix = opts.includeTypePrefix ? "**Role:**" : "";
	const userPrefix = opts.includeTypePrefix ? "**User:**" : "";
	const serverPrefix = opts.includeTypePrefix ? "**Server:**" : "";
	const channelPrefix = opts.includeTypePrefix ? "**Channel:**" : "";
	const unknownPrefix = opts.includeTypePrefix ? "**Unknown:**" : "";
	const posteFix = opts.includeID ? `(${id})` : "";

	function ret(resolve: Discord.GuildChannel | Discord.Role | Discord.User | Discord.GuildMember | Discord.Guild): string {
		const inGuild = !(resolve instanceof Discord.User) &&
			!(resolve instanceof Discord.Guild) &&
			guild && resolve.guild.id == guild.id;

		if (resolve instanceof Discord.GuildChannel) {
			return inGuild ? `${channelPrefix} <#${id}> ${posteFix}` : `${channelPrefix} ${resolve.name} ${posteFix}`;
		} else if (resolve instanceof Discord.Role) {
			return inGuild ? `${rolePrefix} <@&${id}> ${posteFix}` : `${rolePrefix} ${resolve.name} ${posteFix}`;
		} else if (resolve instanceof Discord.User) {
			return `${userPrefix} ${resolve.username} ${posteFix}`
		} else if (resolve instanceof Discord.GuildMember) {
			return `${userPrefix} <@${id}> ${posteFix}`;
		} else if (resolve instanceof Discord.Guild) {
			return `${serverPrefix} ${guildResolve.name} ${posteFix}`
		}
	}

	const guilds = client.guilds.cache.array();
	const guildResolve = guilds.find((g) => g.id == id);
	if (guildResolve) return ret(guildResolve);

	const channel = await client.channels.fetch(id).catch(IGNORE) as Discord.TextChannel;
	if (channel) return ret(channel);

	const userObj = await client.users.fetch(id).catch(IGNORE);
	const user =
		userObj && guild ? await guild.members.fetch(id).catch(IGNORE) : null;
	if (user) return ret(user);
	if (userObj) return ret(userObj);


	let role: Discord.Role;
	for (const checkGuild of guilds) {
		if (!checkGuild) continue;
		const r = await checkGuild.roles.fetch(id).catch(IGNORE);
		if (r) {
			role = r;
			break;
		}
	}
	if (role) return ret(role);

	return `${unknownPrefix} ${id}`;
}
export default displayID;
export { DisplayIdOpts }