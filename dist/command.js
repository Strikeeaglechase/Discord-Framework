class UserRole {
    constructor(user, role) {
        this.user = user;
        this.role = role;
    }
    get id() { return this.value.id; }
    get value() { return this.user ? this.user : this.role; }
    get type() { return this.user ? "user" : "role"; }
}
class Command {
    constructor() {
        this.allowDM = true;
        this.permissions = [];
        this.category = null;
        this.parent = null;
        this.altNames = [];
        this.help = {};
    }
    noPermError(event, ...args) {
        return event.framework.error("You do not have the required permissions");
    }
}
class MultiCommand extends Command {
    constructor() {
        super(...arguments);
        this.subCommands = [];
    }
    run(event) {
        return event.framework.error(`Please specify a valid subcommand: [${this.subCommands.map(sc => sc.name).join("/")}]`);
    }
    check(event) {
        return {
            event: event,
            pass: true,
            failMessage: ""
        };
    }
}
class CommandEvent {
    constructor(frameworkOrEvent, message, app, command) {
        if (frameworkOrEvent instanceof CommandEvent) {
            this.framework = frameworkOrEvent.framework;
            this.message = frameworkOrEvent.message;
            this.app = frameworkOrEvent.app;
            this.command = frameworkOrEvent.command;
        }
        else {
            this.framework = frameworkOrEvent;
            this.message = message;
            this.app = app;
            this.command = command;
        }
        this.updateCommand(this.command);
    }
    updateCommand(newCommand) {
        this.args = this.framework.utils.parseQuotes(this.message.content);
        // Remove non-
        let parent = newCommand.parent;
        let deapth = 0;
        while (parent) {
            parent = parent.parent;
            deapth++;
        }
        while (deapth--)
            this.args.shift();
        this.command = newCommand;
    }
}
export { Command, MultiCommand, CommandEvent, UserRole };
