import FrameworkClient from "./app.js";
import Discord from "discord.js";

type Sendable = string | Discord.MessageEmbed | { embeds: Discord.MessageEmbed[] };

type BotCommandReturn = Sendable | Promise<Sendable> | void | Promise<void>;

class UserRole {
	constructor(public user: Discord.User, public role: Discord.Role) { }
	get id() { return this.value.id }
	get value() { return this.user ? this.user : this.role }
	get type() { return this.user ? "user" : "role" }
}

type BotCommandArgument = number | string | Discord.Role | Discord.User | Discord.GuildMember | UserRole;
type BotCommandFunc = (event: CommandEvent, ...args: BotCommandArgument[]) => BotCommandReturn;

interface MultiCommandRet {
	pass: boolean;
	failMessage: Sendable;
	event: CommandEvent;
}

abstract class Command {
	abstract name: string;
	allowDM: boolean = true;
	permissions: string[] = [];
	category: string = null;
	parent: BotCommand = null;
	altNames: string[] = [];
	help: { msg?: string; usage?: string; } = {}
	slashCommand: boolean = false;
	noPermError(event: CommandEvent, ...args: BotCommandArgument[]): BotCommandReturn {
		return event.framework.error("You do not have the required permissions");
	}
	abstract run(event: CommandEvent, ...args: BotCommandArgument[]): BotCommandReturn;
}

abstract class SlashCommand extends Command {
	abstract run(event: CommandEvent): BotCommandReturn;
}

abstract class MultiCommand extends Command {
	subCommands: BotCommand[] = [];
	run(event: CommandEvent) {
		return event.framework.error(`Please specify a valid subcommand: [${this.subCommands.map(sc => sc.name).join("/")}]`);
	}
	check(event: CommandEvent): MultiCommandRet | Promise<MultiCommandRet> {
		return {
			event: event,
			pass: true,
			failMessage: ""
		}
	}
}

class CommandEvent<T = any> {
	command: BotCommand;
	app: T;
	framework: FrameworkClient;
	message?: Discord.Message;
	args: string[];
	interaction?: Discord.CommandInteraction;
	constructor(frameworkOrEvent: CommandEvent)
	constructor(frameworkOrEvent: FrameworkClient, message: Discord.Message, app: T, command: BotCommand)
	constructor(frameworkOrEvent: FrameworkClient | CommandEvent, message?: Discord.Message, app?: T, command?: BotCommand, interaction?: Discord.CommandInteraction) {
		if (frameworkOrEvent instanceof CommandEvent) {
			this.framework = frameworkOrEvent.framework;
			this.message = frameworkOrEvent.message;
			this.app = frameworkOrEvent.app;
			this.command = frameworkOrEvent.command;
		} else {
			this.framework = frameworkOrEvent;
			this.message = message;
			this.app = app;
			this.command = command;
			this.interaction = interaction;
		}
		this.updateCommand(this.command);
	}
	updateCommand(newCommand: Command) {
		this.args = this.framework.utils.parseQuotes(this.message.content);
		// Remove non-
		let parent = newCommand.parent;
		let deapth = 0;
		while (parent) {
			parent = parent.parent;
			deapth++;
		}
		while (deapth--) this.args.shift();
		this.command = newCommand;
	}
}

type BotCommand = Command | MultiCommand;

export {
	Command,
	SlashCommand,
	MultiCommand,
	BotCommandReturn,
	BotCommandFunc,
	BotCommand,
	Sendable,
	CommandEvent,
	BotCommandArgument,
	UserRole
}