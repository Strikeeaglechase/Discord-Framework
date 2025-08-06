import { ApplicationCommandOptionType, SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import fs from "fs";
import { SlashCommand } from "./slashCommand.js";
const validTypeNames = ["string", "number", "boolean", "User", "TextBasedChannel", "Attachment", "Role"];
// Convert string like "replyTwiceIDFor" into "Reply Twice ID For"
function parseDevName(str) {
    let output = "";
    const isUpper = (c) => (c == undefined ? false : c.toUpperCase() == c);
    output += str[0].toUpperCase();
    for (let i = 1; i < str.length; i++) {
        let cur = str[i];
        let prev = str[i - 1];
        let next = str[i + 1];
        if (!isUpper(prev) && isUpper(cur)) {
            output += " " + cur; // add space before uppercase letter
        }
        else if (isUpper(prev) && isUpper(cur) && !isUpper(next)) {
            output += " " + cur; // add space if end of acronym
        }
        else {
            output += cur;
        }
    }
    return output;
}
function SArg(opts) {
    return function (target, propertyKey, parameterIndex) {
        if (typeof opts == "string") {
            SlashCommandArgumentParser.registerArgument(target, opts, undefined, parameterIndex);
        }
        else {
            SlashCommandArgumentParser.registerArgument(target, opts?.name ?? "", opts, parameterIndex);
        }
    };
}
function NoArgs(target, propertyKey, parameterIndex) {
    SlashCommandArgumentParser.registerArgument(target, "", undefined, -1);
}
class SlashCommandArgumentParser {
    instance = new SlashCommandArgumentParser();
    static commands = new Map();
    static registerArgument(target, name, opts, index) {
        const ctor = target.constructor;
        if (!this.commands.has(ctor)) {
            this.commands.set(ctor, { command: target, args: [] });
        }
        if (index != -1) {
            const command = this.commands.get(ctor);
            command.args.push({ type: "", name, options: opts, paramIndex: index });
        }
    }
    static buildSlashCommand(command, allCommands) {
        if (command._isSubcommand)
            return null;
        console.log(`Building slash command ${command.name}`);
        let commandArgs = this.commands.get(command.constructor);
        if (!commandArgs) {
            if (command instanceof SlashCommand) {
                throw new Error(`Unable to find arguments for command ${command.name}`);
            }
            // Register new command args
            commandArgs = { command, args: [] };
            this.commands.set(command.constructor, commandArgs);
        }
        const slashCommand = new SlashCommandBuilder();
        slashCommand
            .setName(command.name)
            .setDescription(command.description)
            .setDMPermission(command.allowDm)
            .setNSFW(command.nsfw)
            .setDefaultMemberPermissions(command.defaultPermission);
        const children = command.getSubCommands();
        if (children.length > 0) {
            console.log(`Command ${command.name} has ${children.length} children`);
            // command is a group
            children.forEach(child => {
                const childCommand = allCommands.find(c => c.constructor == child);
                const subCommand = new SlashCommandSubcommandBuilder();
                subCommand.setName(childCommand.name).setDescription(childCommand.description);
                console.log(`Registering subcommand ${childCommand.name}`);
                const childArgs = this.commands.get(child);
                if (!childArgs) {
                    throw new Error(`Unable to find arguments for child command ${childCommand.name}`);
                }
                childArgs.args
                    .sort((a, b) => a.paramIndex - b.paramIndex)
                    .forEach(arg => {
                    this.buildArgument(subCommand, arg);
                });
                slashCommand.addSubcommand(subCommand);
            });
        }
        else {
            commandArgs.args
                .sort((a, b) => a.paramIndex - b.paramIndex)
                .forEach(arg => {
                this.buildArgument(slashCommand, arg);
            });
        }
        return slashCommand;
    }
    static registerCommandFromSourceFile(command, file) {
        if (!(command instanceof SlashCommand))
            return;
        const content = fs.readFileSync(file, "utf-8");
        const match = [...content.matchAll(/class [\w\d]+ extends [\w\W]+run\(([\w\W]*?)\)(: ?[\w\W]+)? ?{/g)];
        const runArgs = [...match][0][1];
        const argNameAndType = runArgs.matchAll(/(@SArg\([\w\W]*?\))? ?((?:[\w\d]+)|(?:{[\w\W]+?})): ([\w\d]+)/g);
        const commandArguments = this.commands.get(command.constructor);
        if (!commandArguments) {
            throw new Error(`Unable to find arguments for command ${command.name}`);
        }
        [...argNameAndType].forEach((arg, idx) => {
            const [_, sArg, name, type] = arg;
            if (name.trim().startsWith("{"))
                return;
            if (idx == 0) {
                if (type != "SlashCommandEvent")
                    throw new Error("First argument must be of type SlashCommandEvent");
                return;
            }
            let rType = type.includes(".") ? type.split(".")[1] : type;
            const isValidType = validTypeNames.includes(rType);
            if (!isValidType) {
                throw new Error(`Invalid type ${rType} (${type}) for argument ${name}`);
            }
            const argDef = commandArguments.args.find(a => a.paramIndex == idx);
            if (!argDef)
                throw new Error(`Unable to find argument definition for ${name}`);
            argDef.type = type;
            if (argDef.name == "")
                argDef.name = name.toLowerCase();
        });
    }
    static layoutArguments(command, args) {
        if (args.length == 0)
            return [];
        const commandArgs = this.commands.get(command.constructor);
        if (!commandArgs) {
            throw new Error(`Unable to find arguments for command ${command.name}`);
        }
        let argsToUse = args;
        if (args[0].type == ApplicationCommandOptionType.Subcommand) {
            argsToUse = args[0].options ?? [];
        }
        const resultArgs = [];
        argsToUse.forEach(arg => {
            const argDef = commandArgs.args.find(a => a.name == arg.name);
            if (!argDef)
                throw new Error(`Unable to find argument definition for ${arg.name}`);
            let value;
            switch (arg.type) {
                case ApplicationCommandOptionType.Number:
                case ApplicationCommandOptionType.Boolean:
                case ApplicationCommandOptionType.String:
                    value = arg.value;
                    break;
                case ApplicationCommandOptionType.User:
                    value = arg.user;
                    break;
                case ApplicationCommandOptionType.Channel:
                    value = arg.channel;
                    break;
                case ApplicationCommandOptionType.Attachment:
                    value = arg.attachment;
                    break;
                case ApplicationCommandOptionType.Role:
                    value = arg.role;
                    break;
                default:
                    throw new Error(`Invalid argument type from interaction ${arg.type}`);
            }
            resultArgs[argDef.paramIndex] = value;
        });
        return resultArgs;
    }
    static buildArgument(target, argument) {
        console.log(`Building argument ${argument.name} as type ${argument.type}`);
        const fill = (opt) => {
            opt.setName(argument.name)
                .setDescription(argument.options?.description ?? argument.name)
                .setRequired(argument.options?.required ?? true);
            return opt;
        };
        switch (argument.type) {
            case "string":
                target.addStringOption(opt => {
                    fill(opt).setAutocomplete(argument.options?.autocomplete ?? false);
                    if (argument.options?.choices) {
                        const choices = argument.options.choices.map(c => ({ name: c.name, value: c.value.toString() }));
                        opt.setChoices(...choices);
                    }
                    if (argument.options?.maxLength)
                        opt.setMaxLength(argument.options.maxLength);
                    if (argument.options?.minLength)
                        opt.setMinLength(argument.options.minLength);
                    return opt;
                });
                break;
            case "number":
                target.addNumberOption(opt => {
                    fill(opt);
                    if (argument.options?.choices) {
                        const choices = argument.options.choices.map(c => ({ name: c.name, value: c.value }));
                        opt.setChoices(...choices);
                    }
                    if (argument.options?.max)
                        opt.setMaxValue(argument.options.max);
                    if (argument.options?.min)
                        opt.setMinValue(argument.options.min);
                    return opt;
                });
                break;
            case "boolean":
                target.addBooleanOption(opt => fill(opt));
                break;
            case "User":
                target.addUserOption(opt => fill(opt));
                break;
            case "TextBasedChannel":
                target.addChannelOption(opt => fill(opt));
                break;
            case "Attachment":
                target.addAttachmentOption(opt => fill(opt));
                break;
            case "Role":
                target.addRoleOption(opt => fill(opt));
                break;
            default:
                throw new Error(`Invalid argument type ${argument.type}`);
        }
    }
}
export { SlashCommandArgumentParser, SArg, NoArgs };
