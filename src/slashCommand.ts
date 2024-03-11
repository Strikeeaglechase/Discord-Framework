import { AutocompleteInteraction, CommandInteraction, Embed, EmbedBuilder, PermissionsBitField } from "discord.js";

import FrameworkClient from "./app.js";
import { SlashCommandArgumentType } from "./slashCommandArgumentParser.js";

type Sendable = string | Embed | { embeds: Embed[] } | EmbedBuilder | { embeds: EmbedBuilder[] };

type BotCommandReturn = Sendable | Promise<Sendable> | void | Promise<void>;
type Constructor<T> = new (...args: any[]) => T;

class SlashCommandEvent<T = any> {
	public command: SlashCommand;
	public app: T;
	public framework: FrameworkClient;
	public interaction: CommandInteraction;

	constructor(framework: FrameworkClient, interaction: CommandInteraction, app: T, command: SlashCommand) {
		this.framework = framework;
		this.interaction = interaction;
		this.app = app;
		this.command = command;
	}
}

abstract class SlashCommandParent {
	public abstract name: string;
	public abstract description: string;
	public allowDm = true;
	public nsfw = false;
	public defaultPermission: bigint = PermissionsBitField.Flags.SendMessages;

	public _isSubcommand = false;
	public _parent: SlashCommandParent;
	public _subCommands: SlashCommand[] = [];

	public abstract getSubCommands(): Constructor<SlashCommand>[];
}

abstract class SlashCommand extends SlashCommandParent {
	abstract run(event: SlashCommandEvent, ...args: SlashCommandArgumentType[]): BotCommandReturn;

	public getSubCommands(): Constructor<SlashCommand>[] {
		return [];
	}

	public handleAutocomplete(event: AutocompleteInteraction) {
		throw new Error("Autocomplete not implemented for this command");
	}
}

export { SlashCommand, SlashCommandParent, SlashCommandEvent, Constructor };
