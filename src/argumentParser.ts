import Discord from "discord.js";
import { BotCommandArgument, Command, CommandEvent, UserRole } from "./command.js";
import FrameworkClient from "./app.js";
import { assert } from "./assert.js";

type StringKeyOf<T, K extends keyof T = keyof T> = K extends K ? T[K] extends string ? K : never : never;
type Constructor<T> = new (...args: any[]) => T;

function CommandRun(target: Command, propertyKey: string, descriptor: PropertyDescriptor) {
	const meta = Reflect.getMetadata("design:paramtypes", target, propertyKey);
	for (let i = 1; i < meta.length; i++) {
		ArgumentParser.instance.handleNewArg(target.constructor as Constructor<Command>, [meta[i]], i, {}, false);
	}
}
function Arg(opts?: ArgumentOptions) {
	return function (target: Command, propertyKey: string | symbol, parameterIndex: number) {
		const meta: CommandArgument[] = Reflect.getMetadata("design:paramtypes", target, propertyKey);
		ArgumentParser.instance.handleNewArg(target.constructor as Constructor<Command>, [meta[parameterIndex]], parameterIndex, opts);
	}
}
interface ArgumentOptionsObject {
	max: number,
	min: number,
	options: BotCommandArgument[],
	optional: boolean,
	regex: RegExp;
	// types: Constructor<BotCommandArgument>[]
}
type ArgumentOptions = Partial<ArgumentOptionsObject> | BotCommandArgument[];
interface CommandArgument {
	index: number;
	type: object[];
	options: ArgumentOptions;
}
class ArgumentParser {
	private commandArguments: Map<Constructor<Command>, CommandArgument[]> = new Map();
	framework: FrameworkClient;
	public handleNewArg(command: Constructor<Command>, type: object[], index: number, options: ArgumentOptions, override: boolean = true) {
		if (!this.commandArguments.get(command)) this.commandArguments.set(command, []);
		const commandArgs = this.commandArguments.get(command);
		if (commandArgs[index] && !override) return; // Don't override existing value without override flag
		commandArgs[index] = { options, type, index };
		this.commandArguments.set(command, commandArgs);
	}
	public async parseCommand(command: Constructor<Command>, event: CommandEvent): Promise<BotCommandArgument[]> {
		const args = this.commandArguments.get(command);
		if (!args) return [];
		const parsedProms = args.map(async argument => {
			const input = event.args[argument.index];
			if (input == undefined) {
				if (Array.isArray(argument.options) || !argument.options?.optional) {
					throw new Error("Non-optional argument left blank");
				}
				return null;
			}
			const value = await this.parseArg(input, event, argument);
			return value;
		});
		const parse = await Promise.all(parsedProms);
		return parse;
	}
	private async parseArg(input: string, event: CommandEvent, argument: CommandArgument): Promise<BotCommandArgument> {
		const proms = argument.type.map(type => {
			return this.handleSingleType(input, event, type, argument.index, argument.options);
		});
		const result = await Promise.any(proms).catch((e) => new Error(e.errors.join("\n")));
		if (result instanceof Error) throw result;
		return result;
	}
	private async handleSingleType(input: string, event: CommandEvent, type: object, index: number, options: ArgumentOptions) {
		switch (type) {
			case Number: return this.getNumber(input, index, options);
			case String: return this.getString(input, index, options);
			case Discord.User: return await this.getUser(input, event);
			case Discord.GuildMember: return await this.getMember(input, event);
			case Discord.Role: return await this.getRole(input, event);
			case UserRole: {
				const user = await this.getUser(input, event).catch((e: Error) => e);
				const role = await this.getRole(input, event).catch((e: Error) => e);
				if (user instanceof Error && role instanceof Error) {
					throw new Error(user.message + "\n" + role.message);
				}
				return new UserRole(user instanceof Error ? null : user, role instanceof Error ? null : role);
			}
		}
	}

	private getNumber(input: string, index: number, options: ArgumentOptions) {
		const value = parseFloat(input);
		assert(!isNaN(value), `Please enter a numeric value for argument ${index}`);
		if (Array.isArray(options)) {
			assert(options.includes(value), `"${value}" is not a valid option`);
			return value;
		}
		if (options?.max) assert(value <= options?.max, `The value ${value} is too high`);
		if (options?.min) assert(value >= options?.min, `The value ${value} is too low`);
		if (options?.options) assert(options.options.includes(value), `"${value}" is not a valid option`);
		return value;
	}
	private getString(input: string, index: number, options: ArgumentOptions) {
		if (Array.isArray(options)) {
			assert(options.includes(input?.toLowerCase()), `"${input}" is not a valid value for argument ${index}`);
			return input;
		}
		if (options?.options) assert(options?.options.includes(input.toLowerCase()), `"${input}" is not a valid value for argument ${index}`);
		if (options.regex instanceof RegExp) { assert(options.regex.test(input), `"${input}" is invalid here`) }
		return input;
	}
	private async getUser(input: string, event: CommandEvent) {
		const id = this.resolveId(input);
		const user = await this.framework.client.users.fetch(id as Discord.Snowflake).catch(() => { });
		if (user) return user;
		const member = await this.resolveMember(input, event);
		return member.user;
	}
	private async getMember(input: string, event: CommandEvent) {
		const id = this.resolveId(input);
		const member = await event.message.guild?.members.fetch(id as Discord.Snowflake).catch(() => { });
		if (member) return member;
		const memberByName = await this.resolveMember(input, event);
		return memberByName;
	}
	private async getRole(input: string, event: CommandEvent) {
		const id = this.resolveId(input);
		const role = event.message.guild?.roles.cache.get(id as Discord.Snowflake);
		if (role) return role;
		assert(!!event.message.guild, `To specify a role run the command in the server the role exists`);
		const roleByName = searchForValue(event.message.guild.roles.cache.array(), "name", input);
		assert(!!roleByName, `Cannot find role from "${input}"`);
		return roleByName;
	}


	private async resolveMember(input: string, event: CommandEvent) {
		// If user wasn't able to resolve by that, do a name resolve
		const members = await event.message.guild?.members.fetch().catch(() => { });
		assert(!!members, `Unable to resolve user from "${input}"`);
		const member = this.findMember(members.array(), input);
		assert(!!member, `Unable to resolve user from "${input}"`);
		return member;
	}
	private resolveId(input: string): string {
		if (new RegExp(/<@!?\d+>/).test(input)) {
			return new RegExp(/\d+/g).exec(input)[0];
		} else {
			return input
		}
	}
	private findMember(members: Discord.GuildMember[], search: string) {
		const nameResolve = searchForValue(members.map(m => m.user), "username", search);
		if (nameResolve) return members.find(m => m.id == nameResolve.id);
		const nickResolve = searchForValue(members, "displayName", search);
		if (nickResolve) return nickResolve;
	}
	static instance = new ArgumentParser();
}
function searchForValue<T, K extends StringKeyOf<T>>(arr: Array<T>, key: K, search: string) {
	if (arr.length == 0) return null;
	const startsWith = arr.find((item) => {
		const str = item[key] as unknown as string;
		return str.toLowerCase().startsWith(search.toLowerCase());
	});
	if (startsWith) return startsWith;
	const includes = arr.find((item) => {
		const str = item[key] as unknown as string;
		return str.toLowerCase().includes(search.toLowerCase());
	});
	if (includes) return includes;
	return null;
}
export { Arg, CommandRun, ArgumentParser }