import Discord from "discord.js";
import FrameworkClient from "../app.js";
declare function resolveUser(framework: FrameworkClient, resolvable: string, guild?: Discord.Guild): Promise<Discord.User>;
export default resolveUser;
