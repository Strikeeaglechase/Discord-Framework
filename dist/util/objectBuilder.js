var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Discord from "discord.js";
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
    constructor(framework, display, message, questions) {
        this.framework = framework;
        this.display = display;
        this.message = message;
        this.questions = questions;
    }
    ask(question, obj) {
        return __awaiter(this, void 0, void 0, function* () {
            const prompt = new Discord.MessageEmbed({ description: question.prompt });
            let value;
            switch (question.type) {
                case QuestionType.str:
                    value = yield this.framework.utils.getString(this.message, prompt);
                    break;
                case QuestionType.select:
                    value = (yield this.framework.utils.getSelect(this.message, prompt, question.options))[0];
                    break;
                case QuestionType.button:
                    value = yield this.framework.utils.getButton(this.message, prompt, question.options);
                    break;
            }
            const handled = question.handle ? yield question.handle(value) : { passes: true, value: value };
            if (!handled.passes) {
                this.message.channel.send(this.framework.error(`\`${value}\` is not a valid value here`));
            }
            else {
                obj[question.prop] = handled.value;
            }
            return obj;
        });
    }
    askOneQuestion(obj) {
        return __awaiter(this, void 0, void 0, function* () {
            const emb = yield this.display(obj, this.framework, this.message);
            const toEdit = yield this.framework.utils.getSelect(this.message, emb, [
                { name: "Cancel", description: "Exits without changing any values" },
                ...this.questions.map(q => {
                    return { name: q.name };
                })
            ]).then(v => v[0]);
            if (toEdit == "Cancel")
                return;
            const question = this.questions.find(q => q.name == toEdit);
            const newObj = yield this.ask(question, obj);
            return newObj;
        });
    }
    askAllQuestions(obj = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const exitEmb = new Discord.MessageEmbed({ title: `Press exit at any time to exit` });
            const exit = this.framework.utils.getButton(this.message, exitEmb, [{ name: "Exit", style: "DANGER" }]);
            for (let question of this.questions) {
                const asked = this.ask(question, obj);
                const value = yield Promise.any([exit, asked]);
                if (value instanceof Object) {
                    obj = value;
                }
                else {
                    return null;
                }
            }
            return obj;
        });
    }
}
export { ObjectBuilder, QuestionType };
