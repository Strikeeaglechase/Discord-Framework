import FrameworkClient from "./app.js";
import { BotCommandArgument, Command, CommandEvent } from "./command.js";
declare type Constructor<T> = new (...args: any[]) => T;
declare function CommandRun(target: Command, propertyKey: string, descriptor: PropertyDescriptor): void;
declare function Arg(opts?: ArgumentOptions): (target: Command, propertyKey: string | symbol, parameterIndex: number) => void;
interface ArgumentOptionsObject {
    max: number;
    min: number;
    options: BotCommandArgument[];
    optional: boolean;
    regex: RegExp;
}
declare type ArgumentOptions = Partial<ArgumentOptionsObject> | BotCommandArgument[];
declare class ArgumentParser {
    private commandArguments;
    framework: FrameworkClient;
    handleNewArg(command: Constructor<Command>, type: object[], index: number, options: ArgumentOptions, override?: boolean): void;
    parseCommand(command: Constructor<Command>, event: CommandEvent): Promise<BotCommandArgument[]>;
    private parseArg;
    private handleSingleType;
    private getNumber;
    private getString;
    private getUser;
    private getMember;
    private getRole;
    private resolveMember;
    private resolveId;
    private findMember;
    static instance: ArgumentParser;
}
export { Arg, CommandRun, ArgumentParser };
