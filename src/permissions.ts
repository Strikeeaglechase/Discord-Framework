import Discord from "discord.js";

import FrameworkClient from "./app.js";
import { CollectionManager } from "./collectionManager.js";

interface PermissionEntry {
	name: string;
	allow: string[];
	public: boolean;
}

class PermissionManager {
	private framework: FrameworkClient;
	private permissions: CollectionManager<PermissionEntry>;
	private tracks: Map<string, Map<string, boolean>> = new Map();
	private paths: Set<string> = new Set();
	constructor(framework: FrameworkClient) {
		this.framework = framework;
	}
	get permNames() {
		return [...this.paths];
	}
	public async init() {
		this.permissions =
			await this.framework.database.collection<PermissionEntry>(
				"permissions-new",
				false,
				"name"
			);
		this.framework.log.info(`Permission manager started`);
	}
	public async loadPerms(permissionNames: string[]) {
		permissionNames.forEach((name) => {
			this.paths.add(name);
		});
	}
	public async setPublic(name: string, pub: boolean) {
		const perm = await this.getPermission(name);
		perm.public = pub;
		await this.permissions.update(perm, perm.name);
	}
	public async grant(name: string, id: string) {
		const perm = await this.getPermission(name);
		if (perm.allow.includes(id)) return false;
		perm.allow.push(id);
		await this.permissions.update(perm, perm.name);
		return true;
	}
	public async remove(name: string, id: string) {
		const perm = await this.getPermission(name);
		if (!perm.allow.includes(id)) return false;
		perm.allow = perm.allow.filter((pid) => pid != id);
		await this.permissions.update(perm, perm.name);
		return true;
	}
	public async getPermission(name: string) {
		const perm = await this.permissions.get(name);
		if (perm) return perm;
		return { name: name, allow: [], public: false };
	}
	private async getUserRoles(userId: string): Promise<string[]> {
		if (!this.tracks.get(userId)) {
			this.tracks.set(userId, new Map());
		}
		const guilds = this.framework.client.guilds.cache;
		const roles: string[] = [];
		const proms = guilds.map(async (guild) => {
			if (this.tracks.get(userId).get(guild.id)) return; // If the guild flag is set, this user isnt in the server
			const member = await guild.members
				.fetch(userId as Discord.Snowflake)
				.catch(() => {});
			if (member) member.roles.cache.forEach((r) => roles.push(r.id));
			else this.tracks.get(userId).set(guild.id, true); // Set guild flag
		});
		await Promise.all(proms);
		roles.push(userId);
		return roles;
	}
	public clearUserTracks(userId: string) {
		this.tracks.set(userId, new Map());
	}
	public async check(userId: string, chain: string): Promise<boolean> {
		if (this.framework.overrides.some((id) => id == userId)) return true;
		let curChain = "";
		const itemProms = chain.split(".").map((part) => {
			curChain += curChain ? "." + part : part;
			return this.getPermission(curChain);
		});
		const items = await Promise.all(itemProms);
		if (items.some((item) => item.public)) return true; // If there is a public part of the chain, return true
		const userRoles = await this.getUserRoles(userId);
		for (let item of items) {
			if (userRoles.some((roleId) => item.allow.includes(roleId)))
				return true;
		}
		return false;
	}
}
export { PermissionManager, PermissionEntry };
