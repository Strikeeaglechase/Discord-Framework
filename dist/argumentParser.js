import Discord from "discord.js";
import { assert } from "./assert.js";
import { UserRole } from "./command.js";
function CommandRun(target, propertyKey, descriptor) {
    const meta = Reflect.getMetadata("design:paramtypes", target, propertyKey);
    for (let i = 1; i < meta.length; i++) {
        ArgumentParser.instance.handleNewArg(target.constructor, [meta[i]], i, {}, false);
    }
}
function Arg(opts) {
    return function (target, propertyKey, parameterIndex) {
        const meta = Reflect.getMetadata("design:paramtypes", target, propertyKey);
        ArgumentParser.instance.handleNewArg(target.constructor, [meta[parameterIndex]], parameterIndex, opts);
    };
}
class ArgumentParser {
    commandArguments = new Map();
    framework;
    handleNewArg(command, type, index, options, override = true) {
        if (!this.commandArguments.get(command))
            this.commandArguments.set(command, []);
        const commandArgs = this.commandArguments.get(command);
        if (commandArgs[index] && !override)
            return; // Don't override existing value without override flag
        commandArgs[index] = { options, type, index };
        this.commandArguments.set(command, commandArgs);
    }
    async parseCommand(command, event) {
        const args = this.commandArguments.get(command);
        if (!args)
            return [];
        const parsedProms = args.map(async (argument) => {
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
    async parseArg(input, event, argument) {
        const proms = argument.type.map(type => {
            return this.handleSingleType(input, event, type, argument.index, argument.options);
        });
        const result = await Promise.any(proms).catch((e) => new Error(e.errors.join("\n")));
        if (result instanceof Error)
            throw result;
        return result;
    }
    async handleSingleType(input, event, type, index, options) {
        switch (type) {
            case Number: return this.getNumber(input, index, options);
            case String: return this.getString(input, index, options);
            case Discord.User: return await this.getUser(input, event);
            case Discord.GuildMember: return await this.getMember(input, event);
            case Discord.Role: return await this.getRole(input, event);
            case UserRole: {
                const user = await this.getUser(input, event).catch((e) => e);
                const role = await this.getRole(input, event).catch((e) => e);
                if (user instanceof Error && role instanceof Error) {
                    throw new Error(user.message + "\n" + role.message);
                }
                return new UserRole(user instanceof Error ? null : user, role instanceof Error ? null : role);
            }
        }
    }
    getNumber(input, index, options) {
        const value = parseFloat(input);
        assert(!isNaN(value), `Please enter a numeric value for argument ${index}`);
        if (Array.isArray(options)) {
            assert(options.includes(value), `"${value}" is not a valid option`);
            return value;
        }
        if (options?.max)
            assert(value <= options?.max, `The value ${value} is too high`);
        if (options?.min)
            assert(value >= options?.min, `The value ${value} is too low`);
        if (options?.options)
            assert(options.options.includes(value), `"${value}" is not a valid option`);
        return value;
    }
    getString(input, index, options) {
        if (Array.isArray(options)) {
            assert(options.includes(input?.toLowerCase()), `"${input}" is not a valid value for argument ${index}`);
            return input;
        }
        if (options?.options)
            assert(options?.options.includes(input.toLowerCase()), `"${input}" is not a valid value for argument ${index}`);
        if (options.regex instanceof RegExp) {
            assert(options.regex.test(input), `"${input}" is invalid here`);
        }
        return input;
    }
    async getUser(input, event) {
        const id = this.resolveId(input);
        const user = await this.framework.client.users.fetch(id).catch(() => { });
        if (user)
            return user;
        const member = await this.resolveMember(input, event);
        return member.user;
    }
    async getMember(input, event) {
        const id = this.resolveId(input);
        const member = await event.message.guild?.members.fetch(id).catch(() => { });
        if (member)
            return member;
        const memberByName = await this.resolveMember(input, event);
        return memberByName;
    }
    async getRole(input, event) {
        const id = this.resolveId(input);
        const role = event.message.guild?.roles.cache.get(id);
        if (role)
            return role;
        assert(!!event.message.guild, `To specify a role run the command in the server the role exists`);
        const roleByName = searchForValue([...event.message.guild.roles.cache.values()], "name", input);
        assert(!!roleByName, `Cannot find role from "${input}"`);
        return roleByName;
    }
    async resolveMember(input, event) {
        // If user wasn't able to resolve by that, do a name resolve
        const members = await event.message.guild?.members.fetch().catch(() => { });
        assert(!!members, `Unable to resolve user from "${input}"`);
        const member = this.findMember([...members.values()], input);
        assert(!!member, `Unable to resolve user from "${input}"`);
        return member;
    }
    resolveId(input) {
        if (new RegExp(/<@!?\d+>/).test(input)) {
            return new RegExp(/\d+/g).exec(input)[0];
        }
        else {
            return input;
        }
    }
    findMember(members, search) {
        const nameResolve = searchForValue(members.map(m => m.user), "username", search);
        if (nameResolve)
            return members.find(m => m.id == nameResolve.id);
        const nickResolve = searchForValue(members, "displayName", search);
        if (nickResolve)
            return nickResolve;
    }
    static instance = new ArgumentParser();
}
function searchForValue(arr, key, search) {
    if (arr.length == 0)
        return null;
    const startsWith = arr.find((item) => {
        const str = item[key];
        return str.toLowerCase().startsWith(search.toLowerCase());
    });
    if (startsWith)
        return startsWith;
    const includes = arr.find((item) => {
        const str = item[key];
        return str.toLowerCase().includes(search.toLowerCase());
    });
    if (includes)
        return includes;
    return null;
}
export { Arg, CommandRun, ArgumentParser };
