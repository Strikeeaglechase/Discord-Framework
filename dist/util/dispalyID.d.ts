import Discord from "discord.js";
interface DisplayIdOpts {
    includeTypePrefix: boolean;
    includeID: boolean;
}
declare function displayID(client: Discord.Client, guild: Discord.Guild, idAsString: string, opts?: DisplayIdOpts): Promise<string>;
export default displayID;
export { DisplayIdOpts };
