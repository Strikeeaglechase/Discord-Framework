import Discord from "discord.js";
import FrameworkClient from "./app.js";
type Sendable = string | Discord.Embed | {
    embeds: Discord.Embed[];
} | Discord.EmbedBuilder | {
    embeds: Discord.EmbedBuilder[];
};
type BotCommandReturn = Sendable | Promise<Sendable> | void | Promise<void>;
declare class UserRole {
    user: Discord.User;
    role: Discord.Role;
    constructor(user: Discord.User, role: Discord.Role);
    get id(): string;
    get value(): Discord.Role | Discord.User;
    get type(): "user" | "role";
}
type BotCommandArgument = number | string | Discord.Role | Discord.User | Discord.GuildMember | UserRole;
type BotCommandFunc = (event: CommandEvent, ...args: BotCommandArgument[]) => BotCommandReturn;
interface MultiCommandRet {
    pass: boolean;
    failMessage: Sendable;
    event: CommandEvent;
}
declare abstract class Command {
    abstract name: string;
    allowDM: boolean;
    permissions: string[];
    category: string;
    parent: BotCommand;
    altNames: string[];
    help: {
        msg?: string;
        usage?: string;
    };
    noPermError(event: CommandEvent, ...args: BotCommandArgument[]): BotCommandReturn;
    abstract run(event: CommandEvent, ...args: BotCommandArgument[]): BotCommandReturn;
}
declare abstract class MultiCommand extends Command {
    subCommands: BotCommand[];
    run(event: CommandEvent): {
        embeds: Discord.EmbedBuilder[];
        ephemeral: boolean;
    };
    check(event: CommandEvent): MultiCommandRet | Promise<MultiCommandRet>;
}
declare class CommandEvent<T = any> {
    command: BotCommand;
    app: T;
    framework: FrameworkClient;
    message: Discord.Message;
    args: string[];
    constructor(frameworkOrEvent: CommandEvent);
    constructor(frameworkOrEvent: FrameworkClient, message: Discord.Message, app: T, command: BotCommand);
    updateCommand(newCommand: Command): void;
}
type BotCommand = Command | MultiCommand;
export { Command, MultiCommand, BotCommandReturn, BotCommandFunc, BotCommand, Sendable, CommandEvent, BotCommandArgument, UserRole };
