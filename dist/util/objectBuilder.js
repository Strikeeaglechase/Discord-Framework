import Discord, { ButtonStyle } from "discord.js";
var QuestionType;
(function (QuestionType) {
    QuestionType[QuestionType["str"] = 0] = "str";
    QuestionType[QuestionType["button"] = 1] = "button";
    QuestionType[QuestionType["select"] = 2] = "select";
})(QuestionType || (QuestionType = {}));
// interface Question<Obj> {
// 	type:
// }
class ObjectBuilder {
    framework;
    display;
    message;
    questions;
    constructor(framework, display, message, questions) {
        this.framework = framework;
        this.display = display;
        this.message = message;
        this.questions = questions;
    }
    async ask(question, obj) {
        const prompt = new Discord.EmbedBuilder({ description: question.prompt });
        let value;
        switch (question.type) {
            case QuestionType.str:
                value = await this.framework.utils.getString(this.message, prompt);
                break;
            case QuestionType.select:
                value = (await this.framework.utils.getSelect(this.message, prompt, question.options))[0];
                break;
            case QuestionType.button:
                value = await this.framework.utils.getButton(this.message, prompt, question.options);
                break;
        }
        const handled = question.handle ? await question.handle(value) : { passes: true, value: value };
        if (!handled.passes) {
            this.message.channel.send(this.framework.error(`\`${value}\` is not a valid value here`));
        }
        else {
            obj[question.prop] = handled.value;
        }
        return obj;
    }
    async askOneQuestion(obj) {
        const emb = await this.display(obj, this.framework, this.message);
        const toEdit = await this.framework.utils
            .getSelect(this.message, emb, [
            { name: "Cancel", description: "Exits without changing any values" },
            ...this.questions.map(q => {
                return { name: q.name };
            })
        ])
            .then(v => v[0]);
        if (toEdit == "Cancel")
            return;
        const question = this.questions.find(q => q.name == toEdit);
        const newObj = await this.ask(question, obj);
        return newObj;
    }
    async askAllQuestions(obj = {}) {
        const exitEmb = new Discord.EmbedBuilder({ title: `Press exit at any time to exit` });
        const exit = this.framework.utils.getButton(this.message, exitEmb, [{ name: "Exit", style: ButtonStyle.Danger }]);
        for (let question of this.questions) {
            const asked = this.ask(question, obj);
            const value = await Promise.any([exit, asked]);
            if (value instanceof Object) {
                obj = value;
            }
            else {
                return null;
            }
        }
        return obj;
    }
}
export { ObjectBuilder, QuestionType };
