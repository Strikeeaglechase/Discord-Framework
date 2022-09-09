strike-discord-framework is a simple, lightweight command and permission framework for Discord.js

# Setup

```ts
const framework = new Framework(opts);
await framework.init();
```
This code will start the framework, the opts object has the following stucture
```ts
interface FrameworkClientOptions {
	token: string // Discord bot token,
	name: string // Application name, used for logging and database setup,
	commandsPath: string // Path to the commands folder,
	defaultPrefix: string // Prefix
	databaseOpts: {
		databaseName: string, // Name of the mongoDB database
		url: string // URL to connect to mongoDB
	}
	loggerOpts: { // (Optional)
		logChannels: Record<LogLevel, string>; // (Optional) A map between the log level, and where it should go
		logToFile: boolean; // If the framework should log out to a file
		filePath: string; // (Optional) Filepath to store log files, each log file is separated by day
	}
	ownerID: string; // (Optional) Your discord Id for permission override
	dmPrefixOnPing? boolean; // (Optional) If the bot should DM user the prefix whenever its pinged
	permErrorSilently: boolean; // (Optional) If permission errors should be quietly ignored, rather then sending the user an error
	dmErrorSilently: boolean; // (Optional) If the bot should tell users that they cannot run that command in DMs when its set as such
	clientOptions: ClientOptions; // (Optional) Discord client options, passed directly to DJS. Its highly recommend you set this as otherwise the intents are set to everything
	slashCommandReset: boolean // (Optional) Removed all slash commands from your application. Can be useful if you registered a bad command. (Only for Slash Commands)
}
```

When you init the framework, you may also pass in an optional object that will be attached to all CommandEvent's

```ts
await framework.init(some_object)
```

In order to load default commands use the `loadBotCommands` method with a path pointing to the frameworks `defaultCommands` method
The following default commands are loadable:

#### Default Commands

- misc
	- help - Uses the `help` object on commands to show user help
	- ping - A simple ping-pong command to show the bot is running
- admin
	- eval - Allows the owner of the bot to execute javascript code
	- override - Enables override of all permissions
	- prefix - Allows a server admin to change the prefix value in a guild
	- perm - Allows for the control of command permission flags

This code should point to the default commands path in most nodejs project
```ts
framework.loadBotCommands(`${process.cwd()}/node_modules/strike-discord-framework/dist/defaultCommands/`);
```

# Commands

## Command folder structure

Within your commands folder, you should have multiple sub directories for each category of command. The above shows the commands and how they are arranged. There is a second type of command called "MultiCommand" that allows for a set of commands that fall under the same parent command, for the above `perm` is a multi command so the folder structure looks like this
- misc
	- help.ts
	- ping.ts
- admin
	- eval.ts
	- override.ts
	- prefix.ts
	- perm
		- grant.ts
		- list.ts
		- perm.ts
		- remove.ts

`perm` is a multicomamnd as there is a `perm.ts` file within it. Multi-commands are defined by having a file, with the same name as the folder in it. xxx/xxx.ts = multi command. All other files within the folder will be counted as child commands of the multi-command

## Command

To create a command, place a file within the commands directory. `commands/category_name/filename.ts`
The file should have a default export, that is a class that extends the `Command`
The command class has the following structure
```ts
abstract class Command {
	abstract name: string; // (Required) The command name, what the user run
	allowDM: boolean = true; // If this command can be ran in DMs
	permissions: string[] = []; // The permission flags this command has
	altNames: string[] = []; // Alternative names for this command
	help: { msg?: string; usage?: string; } = {} // A help object used for the help command. Slash commands re-use this for the description.
	slashCommand: boolean = false; // Wether or not this is a slash command.
	slashOptions: SlashCommandOption[] = [] // The arguments for this slash command.
	noPermError(event: CommandEvent, ...args: BotCommandArgument[]): BotCommandReturn; // An optional method that will be called whenever a user without permissions executes the command
	abstract run(event: CommandEvent, ...args: BotCommandArgument[]): BotCommandReturn; // (Required) The method that is run when a user executes a command
}
```
### BotCommandReturn

BotCommandReturn can either be void, or a `Sendable`. It can also be a promise of either of those.
```ts
type Sendable = string | Discord.MessageEmbed | { embeds: Discord.MessageEmbed[] };
```

### BotCommandArgument

The type for automatic argument parsing: `number | string | Discord.Role | Discord.User | Discord.GuildMember | UserRole;` UserRole is a special class, that will resolve either a user or a role. The following properties exist:
- id - Role or user Id
- value - The actual object, either a `Discord.User` or `Discord.Role`
- type - Either "user" or "role"

## Multi-Command
```
Note: Multi-Command is not available with Slash commands.
```

The `MultiCommand` class extends the Command class. All sub commands are refrenced via the primary command, such as when the user runs a command it has the following syntax:

`[prefix][multi-command-name] [subcommand] [arguments]`
A multi-command has one additional property to regular commands, `check`. Check is optional, and by default will not modify command execution. 
```ts
check(event: CommandEvent): MultiCommandRet | Promise<MultiCommandRet>
```

All other commands of a multi-command should be just regular multi-commands. If the base command cannot be executed for whatever reason (DM when DMs are set to false, no permissions, etc) then the child command will not be ran

### MultiCommandRet

An object with the following structure
```ts
{
	event: CommandEvent; // An updated CommandEvent, very useful if you would like to extend the command event class and add additional properties. This updated command event will be passed to the run method of the child command
	pass: boolean; // If this command should continue execution and run the child command
	failMessage: Sendable; // If pass is set to false, this will be sent to the user
}
```
## Slash Commands

A Slash command is built right into a regular command! Most of a slash command works just like a regular command, but there are some slight differences to be aware of.
```ts
abstract class Slashcommand extends Command {
	... // All other properties are the same as a regular command
	slashCommandOptions: SlashCommandOptions = [] // The arguments for this slash command
}
```

Slash commands are an extention of regular commands. The major difference is that they do not work as text-based commands but can only be invoked using a `/` in Discord.active

### SlashCommandOptions
```ts
interface SlashCommandOption {
	name: string; // The name of this argument
	description: string; // A short description of this argument
	type: Discord.ApplicationCommandOptionType; // The type of this argument. See Discord.js docs for more info.
	required?: boolean; // If this argument is required
}
```

A `SlashCommandOption` is required to pass arguments to a slash command. These are used in the `SlashCommand.slashCommandOptions` property.

### SlashCommandEvent
```ts
class SlashCommandEvent<T = any> extends CommandEvent<T> {
	interaction?: Discord.CommandInteraction; // Interaction object that was created when the user ran the command
}
```

A `SlashCommandEvent` is a special type of `CommandEvent` that is passed to the `run` method of a slash command. What makes it different from a `CommandEvent` is that the `message` property no longer exists. This is replaced by the `interaction` proptery instead.


## CommandEvent 

Command event is the primary method to interact with the framework when commands execute. The class has the following structure
```ts
class CommandEvent<T = any> {
	command: BotCommand; // The bot command that this event was triggered by, if its a part of a multi-command this will be the child command that gets executed
	app: T; // This is the value that was passed into the framework on initialization
	framework: FrameworkClient; // A reference to the framework instance
	message: Discord.Message; // The discord message that triggered this command (Only for Text Commands)
	args: string[]; // A list of arguments the user gave, split by spaces, but where anything in quotations will be grouped. hello world "hello world" (Only for Text Commands)
	interaction?: Discord.Interaction //If a command is a slash command, it will give you details about the interaction (Only for Slash Commands)
	constructor(event: CommandEvent); // If you extend the command event class then pass in the original command event to assign the values 
}
```

## Argument Parsing
```
Note: This is only available for text-based commands.
```
To use automatic argument parsing there are some pre-requisites that must be completed first
- `reflect-metadata` is included, and loaded before the framework
- You are using typescript
- tsconfig.json has the following:
	- "experimentalDecorators": true
	- "emitDecoratorMetadata": true

The argument types that can be parsed are stated above, to enable argument parsing simply decorate a command with the `@CommandRun` tag. This would look something like
```ts 
class MyCommand{
	name = "command"
	@CommandRun
	async run(event: CommandEvent, role: Discord.Role, name: string, user: Discord.string) {}
}
```
All the arguments will be automatically parsed and given to the run command. If any argument fails to parse it will not run the command

String and number arguments can have specific restrictions applied to them using the `Arg` decorator
- Numbers can restrict using `min` and `max` properties
- Strings can restrict using the `regex` property
- Both can have the following properties:
	- `optional` - If this value is strictly required, or can be omitted (this can be applied to the other types as well)
	- `options` - Strictly sets what values are valid, is an array of possibilities

### Example

Get a number greater than 5, and optionally get a string thats either "hello" or "world"
```ts
class MyCommand{
	name = "command"
	@CommandRun
	async run(event: CommandEvent, @Arg({min:5}) num: number, @Arg({optional: true, options: ["hello", "world"]}) str: string) {}
}
```


# Utilities
```
Note: Not all utilities are currently compatible with Slash commands.
```

All utilities are accessed via `framework.utils`, which will contain several utility methods

### Display Id

`framework.utils.displayId(id: string, guild?: Discord.Guild, opts?: DisplayIdOpts)`

Formats a discord Id to be human readable
|Argument | type | Description|
|- | - | -|
|id | string |  The Id that will be displayed, can be a user, member, channel, role, or server Id|
|guild | Discord.Guild? | The context of the Id for formatting as a ping or raw string|
|opts | DisplayIdOpts | an object with the booleans `includeTypePrefix` and `includeID`|
|returns | Promise\<string> | The formatted user-friendly string that describes the Id|

### Parse Quotes

`framework.utils.parseQuotes(str: string)`

Takes in a string, and splits the string into parts based off spaces and grouped by quotes
|Argument | type | Description|
|- | - | -|
|str | string | Input string|
|returns | string[] | Array of the split and parsed strings|

### React Confirm

`framework.utils.reactConfirm(prompt: string, message: Discord.Message, opts?: ConfirmOptions)`

Gets a confirm/cancel action from the user
|Argument | type | Description|
|- | - | -|
|promot | string | Thing to ask the user to confirm|
|message | Discord.Message | Message from the user, used to target specific user and channel|
|opts | ConfirmOptions | Optional set of options to configure how the framework should respond to the input|

`ConfirmOptions` has the following structure, every property is optional
```ts
interface ConfirmOptions {
	visual: boolean; // If the replys should be ephemeral or not
	onCancelMessage: Sendable; // The message sent when the user presses cancel
	onConfirmMessage: Sendable; // Message sent when user presses confirm
	onConfirm: () => Sendable | Promise<Sendable>; // Callback on pressing confirm, return value is sent to user
	onCancel: () => Sendable | Promise<Sendable>; // Callback on pressing cancel, return value is sent to user 
};
```

### Resolve User

`framework.utils.resolveUser(resolvable: string, guild?: Discord.Guild)`

Attemptes to resolve a Discord.User from a string, by id, name, and nickname
|Argument | type | Description|
|- | - | -|
|resolvable |string| String to try to resolve to a user|
|guild | Discord.Guild | Optional to help with the resolotion|
|returns | Promise\<Discord.User> | Returns the user that was found. WIll be null if none found|

## User input helpers

There are four primary methods to get user input, those are
- getString - Gets a single message from the user and returns its content 
- getSelect - Creates a drop down select and gets N number of options from it
- getButton - Creates a message with buttons on it, and returns the first the user clicks
- getButtonSelect - Creates a message with buttons, and allows the user to press multiple buttons

### getString

|Argument | type | Description|
|- | - | -|
|message| Discord.Message| The message from the user to target user and channel|
|prompt| Discord.MessageEmbed| The embed to send as the prompt|
|returns | Promise\<string>| the user entered value|

### getSelect

|Argument | type | Description|
|- | - | -|
|message| Discord.Message| The message from the user to target user and channel|
|prompt| Discord.MessageEmbed| The embed to send as the prompt|
|options| SelectOption[]| The selection options|
|values| number = 1| How many values for the user to enter, defaults to one|
|returns | Promise\<string[]>| the user selected value(s)|

`SelectOption` has the structure
```ts
interface SelectOption {
	name: string; 
	description?: string;
	emoji?: string;
	value?: string; // If value is defined, the returned value is this, otherwise its the name
}
```

### getButton

|Argument | type | Description|
|- | - | -|
|message| Discord.Message| The message from the user to target user and channel|
|prompt| Discord.MessageEmbed| The embed to send as the prompt|
|options| ButtonOption[]| The button options|
|returns | Promise\<string>| the value of the button the user pressed|

`ButtonOption` has the structure
```ts
interface ButtonOption {
	name: string;
	emoji?: string;
	value?: string; // If value is defined, the returned value is this, otherwise its the name
	disabled?: boolean;
	style: "PRIMARY" | "SECONDARY" | "SUCCESS" | "DANGER";
}
```

### getButtonSelect

|Argument | type | Description|
|- | - | -|
|message| Discord.Message| The message from the user to target user and channel|
|prompt| Discord.MessageEmbed| The embed to send as the prompt|
|options| ButtonSelectOption[]| The button options|
|returns | Promise\<void>| 

`ButtonSelectOption` has the structure
```ts
interface ButtonSelectOption {
	button: ButtonOption;
	onSelect: (itr: Discord.ButtonInteraction, updateButtons: (options: ButtonSelectOption[]) => Promise<void>) => void | Promise<void>;
}
```
`onSelect` gets two values, the interaction, and an `updateButtons` callback that can be used to update the selection options after the user clicks a button, it is not required that you update anything




## Paged Embeds

There are two types of paged embeds, `NamedPageEmbed` or `NumberedPageEmbed`, where named uses string indexs selected by the user, and numbered uses sequential numeric indexs.

There are two methods used to construct these classes, and they have near identical siguatures
`framework.utils.namedPageEmbed(message: Discord.Message, base: EmbedCallback, init: EmbedCallback, pages: NamedPage[])`
|Argument | type | Description|
|- | - | -|
|message| Discord.Message| The message from the user to target user and channel|
|base| EmbedCallback | This is the message first sent, where either the controls for moving backwards and forwards are created, or the selection for the named pages is added|
|init| EmbedCallback | Creates the initial emebed for the page after an interaction|
|pages| NamedPage[] | Array of pages the user can select|
|returns | NamedPageEmbed|

For a numbered page embed simply replace `NamedPage` with `NumberedPage` and use `framework.utils.numberPageEmbed`

`EmbedCallback` is a simple callback type that resolves an embed 
```ts
type EmbedCallback = () => Discord.MessageEmbed | Promise<Discord.MessageEmbed>;
```
`NamedPage` is an object to describe a single page of the embed
```ts
interface NamedPage {
	name: string; // Name shown in the select
	description?: string; // Description in the select
	emoji?: string; // Emoji in the select
	get(existing: Discord.MessageEmbed, name: string): Discord.MessageEmbed | Promise<Discord.MessageEmbed> // Callback that will be executed when this page is selected, should return the updated embed
}
```
`NumberedPage` is simular to `NamedPage` but for numrically indexed pages
```ts
type NumberedPage = (existing: Discord.MessageEmbed, index: number) => Discord.MessageEmbed | Promise<Discord.MessageEmbed>;
```


# Object Builder

`framework.utils.objectBuilder<Obj>(display: DisplayFunc, message: Discord.Message, questions: Question[])`
|Argument | type | Description|
|- | - | -|
|display| DisplayFunc| A function with the following signature `(obj: Object, framework: FrameworkClient, message: Discord.Message) => Discord.MessageEmbed \| Promise<Discord.MessageEmbed>`. This is used by the object builder class to show the user the object being edited|
|message| Discord.Message | Used to target the specific user and channel|
|questions| Question[] | An array of questions that can be used to modify the object|
|returns | ObjectBuilder\<Obj> | An instance of the OjectBuilder class that can be used to modify or create the object|

## ObjectBuilder class

### Question

There are three types of questions, each extend from the base question interface
```ts
interface BaseQuestion {
	type: QuestionType; // QuestionType is an enum with str, button, and select values
	handle?: (value: string) => { passes: boolean; value: any }| Promise<{ passes: boolean; value: any }>; // Called when the user inputs a value, allows for modification of the value type and for rejecting the value outright
	prop: string; // The property on the object to set
	name: string; // The name of this question, used to select to show the user options in a drop down
	prompt: string; // The prompt to ask the user when asking for input
}
```
- `QuestionType.str` (`StringQuestion`) - Gets a string from the user, no additional properties over BaseQuestion
- `QuestionType.select` (`SelectQuestion`) - Gets an option from the user via a select, has an `options` property that should be of type `SelectOption[]`. Uses the `getSelect` util
- `QuestionType.button` (`ButtonQuestion`) - Promopts the user to press a button, with the options being defined in an `options` property that should be of type `ButtonOption[]`. Uses the `getButton` util

### Ask One Question

`ObjectBuilder.askOneQuestion(obj: Obj)`

Asks a single question from the user, where they can select the question they would like to answer. If the user presses exit then the method will return null

|Argument | type | Description|
|- | - | -|
|obj | Obj | The object that will have a modification preformed, and returned once the user makes the change|
|returns | Promise\<Obj> | The modified object (may be null)|


### Ask all questions

`ObjectBuilder.askAllQuestions(obj: Partial<Obj> = {})`

Asks the users all questions sequentially and builds up the object from that

|Argument | type | Description|
|- | - | -|
|obj | Partial\<Obj> | Optional object to start with, useful for default values|
|returns | Promise\<Obj> | The created object, may be null if the user exits|
