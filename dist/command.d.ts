import FrameworkClient from "./app.js";
import Discord from "discord.js";
declare type Sendable = string | Discord.MessageEmbed | {
    embeds: Discord.MessageEmbed[];
};
declare type BotCommandReturn = Sendable | Promise<Sendable> | void | Promise<void>;
declare class UserRole {
    user: Discord.User;
    role: Discord.Role;
    constructor(user: Discord.User, role: Discord.Role);
    get id(): string;
    get value(): Discord.User | Discord.Role;
    get type(): "user" | "role";
}
/**
 * Type for Slash Command Options.
 */
interface SlashCommandOption {
    name: string;
    description: string;
    type: Discord.ApplicationCommandOptionType;
    required?: boolean;
}
declare type BotCommandArgument = number | string | Discord.Role | Discord.User | Discord.GuildMember | UserRole;
declare type BotCommandFunc = (event: CommandEvent, ...args: BotCommandArgument[]) => BotCommandReturn;
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
declare abstract class SlashCommand extends Command {
    slashOptions?: SlashCommandOption[];
    noPermError(event: CommandEvent, ...args: BotCommandArgument[]): BotCommandReturn;
    abstract run(event: SlashCommandEvent): BotCommandReturn;
}
declare abstract class MultiCommand extends Command {
    subCommands: BotCommand[];
    run(event: CommandEvent): {
        embeds: Discord.MessageEmbed[];
        ephemeral: boolean;
    };
    check(event: CommandEvent): MultiCommandRet | Promise<MultiCommandRet>;
}
/**
 * The event object for a command.
 * @param command The command that was run.
 * @param app The app.
 * @param framework A reference to the Framework
 * @param message The message that triggered the command.
 */
declare class CommandEvent<T = any> {
    command: BotCommand;
    app: T;
    framework: FrameworkClient;
    message?: Discord.Message;
    args: string[];
    constructor(frameworkOrEvent: CommandEvent);
    constructor(frameworkOrEvent: FrameworkClient, message: Discord.Message, app: T, command: BotCommand);
    updateCommand(newCommand: Command): void;
}
/**
 * The event object for a SlashCommand.
 * @param framework A reference to the Framework
 * @param interaction The interaction that triggered the command.
 * @param command The command that was run.
 * @param app The app.
 */
declare class SlashCommandEvent<T = any> extends CommandEvent<T> {
    interaction?: Discord.CommandInteraction;
    constructor(framework: FrameworkClient, interaction: Discord.CommandInteraction, app: T, command: BotCommand);
}
declare type BotCommand = Command | MultiCommand;
export { Command, SlashCommandOption, MultiCommand, BotCommandReturn, BotCommandFunc, BotCommand, SlashCommand, Sendable, CommandEvent, SlashCommandEvent, BotCommandArgument, UserRole };
