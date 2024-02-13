import { Attachment, Channel, CommandInteractionOption, SlashCommandBuilder, User } from "discord.js";
import { SlashCommand, SlashCommandParent } from "./slashCommand.js";
type SlashCommandArgumentType = string | number | boolean | User | Channel | Attachment;
interface ArgumentOptions {
    choices?: {
        name: string;
        value: string | number;
    }[];
    required?: boolean;
    min?: number;
    max?: number;
    maxLength?: number;
    minLength?: number;
    autocomplete?: boolean;
    name?: string;
    description?: string;
}
declare function SArg(opts?: ArgumentOptions | string): (target: SlashCommand, propertyKey: string | symbol, parameterIndex: number) => void;
declare function NoArgs(target: SlashCommand, propertyKey: any, parameterIndex: any): void;
declare class SlashCommandArgumentParser {
    instance: SlashCommandArgumentParser;
    private static commands;
    static registerArgument(target: SlashCommand, name: string, opts: ArgumentOptions | undefined, index: number): void;
    static buildSlashCommand(command: SlashCommandParent, allCommands: SlashCommandParent[]): SlashCommandBuilder;
    static registerCommandFromSourceFile(command: SlashCommandParent, file: string): void;
    static layoutArguments(command: SlashCommand, args: readonly CommandInteractionOption[]): SlashCommandArgumentType[];
    private static buildArgument;
}
export { SlashCommandArgumentParser, SlashCommandArgumentType, SArg, NoArgs, ArgumentOptions };
