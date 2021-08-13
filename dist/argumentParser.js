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
import { UserRole } from "./command.js";
import { assert } from "./assert.js";
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
    constructor() {
        this.commandArguments = new Map();
    }
    handleNewArg(command, type, index, options, override = true) {
        if (!this.commandArguments.get(command))
            this.commandArguments.set(command, []);
        const commandArgs = this.commandArguments.get(command);
        if (commandArgs[index] && !override)
            return; // Don't override existing value without override flag
        commandArgs[index] = { options, type, index };
        this.commandArguments.set(command, commandArgs);
    }
    parseCommand(command, event) {
        return __awaiter(this, void 0, void 0, function* () {
            const args = this.commandArguments.get(command);
            if (!args)
                return [];
            const parsedProms = args.map((argument) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const input = event.args[argument.index];
                if (input == undefined) {
                    if (Array.isArray(argument.options) || !((_a = argument.options) === null || _a === void 0 ? void 0 : _a.optional)) {
                        throw new Error("Non-optional argument left blank");
                    }
                    return null;
                }
                const value = yield this.parseArg(input, event, argument);
                return value;
            }));
            const parse = yield Promise.all(parsedProms);
            return parse;
        });
    }
    parseArg(input, event, argument) {
        return __awaiter(this, void 0, void 0, function* () {
            const proms = argument.type.map(type => {
                return this.handleSingleType(input, event, type, argument.index, argument.options);
            });
            const result = yield Promise.any(proms).catch((e) => new Error(e.errors.join("\n")));
            if (result instanceof Error)
                throw result;
            return result;
        });
    }
    handleSingleType(input, event, type, index, options) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (type) {
                case Number: return this.getNumber(input, index, options);
                case String: return this.getString(input, index, options);
                case Discord.User: return yield this.getUser(input, event);
                case Discord.GuildMember: return yield this.getMember(input, event);
                case Discord.Role: return yield this.getRole(input, event);
                case UserRole: {
                    const user = yield this.getUser(input, event).catch((e) => e);
                    const role = yield this.getRole(input, event).catch((e) => e);
                    if (user instanceof Error && role instanceof Error) {
                        throw new Error(user.message + "\n" + role.message);
                    }
                    return new UserRole(user instanceof Error ? null : user, role instanceof Error ? null : role);
                }
            }
        });
    }
    getNumber(input, index, options) {
        const value = parseFloat(input);
        assert(!isNaN(value), `Please enter a numeric value for argument ${index}`);
        if (Array.isArray(options)) {
            assert(options.includes(value), `"${value}" is not a valid option`);
            return value;
        }
        if (options === null || options === void 0 ? void 0 : options.max)
            assert(value <= (options === null || options === void 0 ? void 0 : options.max), `The value ${value} is too high`);
        if (options === null || options === void 0 ? void 0 : options.min)
            assert(value >= (options === null || options === void 0 ? void 0 : options.min), `The value ${value} is too low`);
        if (options === null || options === void 0 ? void 0 : options.options)
            assert(options.options.includes(value), `"${value}" is not a valid option`);
        return value;
    }
    getString(input, index, options) {
        if (Array.isArray(options)) {
            assert(options.includes(input === null || input === void 0 ? void 0 : input.toLowerCase()), `"${input}" is not a valid value for argument ${index}`);
            return input;
        }
        if (options === null || options === void 0 ? void 0 : options.options)
            assert(options === null || options === void 0 ? void 0 : options.options.includes(input.toLowerCase()), `"${input}" is not a valid value for argument ${index}`);
        if (options.regex instanceof RegExp) {
            assert(options.regex.test(input), `"${input}" is invalid here`);
        }
        return input;
    }
    getUser(input, event) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = this.resolveId(input);
            const user = yield this.framework.client.users.fetch(id).catch(() => { });
            if (user)
                return user;
            const member = yield this.resolveMember(input, event);
            return member.user;
        });
    }
    getMember(input, event) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const id = this.resolveId(input);
            const member = yield ((_a = event.message.guild) === null || _a === void 0 ? void 0 : _a.members.fetch(id).catch(() => { }));
            if (member)
                return member;
            const memberByName = yield this.resolveMember(input, event);
            return memberByName;
        });
    }
    getRole(input, event) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const id = this.resolveId(input);
            const role = (_a = event.message.guild) === null || _a === void 0 ? void 0 : _a.roles.cache.get(id);
            if (role)
                return role;
            assert(!!event.message.guild, `To specify a role run the command in the server the role exists`);
            const roleByName = searchForValue([...event.message.guild.roles.cache.values()], "name", input);
            assert(!!roleByName, `Cannot find role from "${input}"`);
            return roleByName;
        });
    }
    resolveMember(input, event) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // If user wasn't able to resolve by that, do a name resolve
            const members = yield ((_a = event.message.guild) === null || _a === void 0 ? void 0 : _a.members.fetch().catch(() => { }));
            assert(!!members, `Unable to resolve user from "${input}"`);
            const member = this.findMember([...members.values()], input);
            assert(!!member, `Unable to resolve user from "${input}"`);
            return member;
        });
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
}
ArgumentParser.instance = new ArgumentParser();
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
