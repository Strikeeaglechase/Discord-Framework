import Discord, { ButtonStyle } from "discord.js";

import FrameworkClient from "../app.js";
import { ButtonOption } from "./inputs/getButton.js";
import { SelectOption } from "./inputs/getDropdown.js";

enum QuestionType {
	str,
	button,
	select
}
type P<T> = T | Promise<T>;
interface BaseQuestion {
	type: QuestionType;
	handle?: (value: string) => P<{ passes: boolean; value: any }>;
	prop: string;
	name: string;
	prompt: string;
}
interface StringQuestion extends BaseQuestion {
	type: QuestionType.str;
}
interface SelectQuestion extends BaseQuestion {
	type: QuestionType.select;
	options: SelectOption[];
}
interface ButtonQuestion extends BaseQuestion {
	type: QuestionType.button;
	options: ButtonOption[];
}
type Question = StringQuestion | SelectQuestion | ButtonQuestion;
type DisplayFunc = (obj: Object, framework: FrameworkClient, message: Discord.Message) => P<Discord.EmbedBuilder>;

// interface Question<Obj> {
// 	type:
// }
class ObjectBuilder<Obj> {
	constructor(private framework: FrameworkClient, private display: DisplayFunc, private message: Discord.Message, private questions: Question[]) {}
	private async ask(question: Question, obj: Partial<Obj>): Promise<Partial<Obj>> {
		const prompt = new Discord.EmbedBuilder({ description: question.prompt });
		let value: string;
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
		} else {
			obj[question.prop] = handled.value;
		}
		return obj;
	}
	public async askOneQuestion(obj: Obj) {
		const emb = await this.display(obj, this.framework, this.message);
		const toEdit = await this.framework.utils
			.getSelect(this.message, emb, [
				{ name: "Cancel", description: "Exits without changing any values" },
				...this.questions.map(q => {
					return { name: q.name };
				})
			])
			.then(v => v[0]);
		if (toEdit == "Cancel") return;
		const question = this.questions.find(q => q.name == toEdit);
		const newObj = await this.ask(question, obj);

		return newObj;
	}
	public async askAllQuestions(obj: Partial<Obj> = {}): Promise<Obj | null> {
		const exitEmb = new Discord.EmbedBuilder({ title: `Press exit at any time to exit` });
		const exit = this.framework.utils.getButton(this.message, exitEmb, [{ name: "Exit", style: ButtonStyle.Danger }]);
		for (let question of this.questions) {
			const asked = this.ask(question, obj);
			const value = await Promise.any<string | Partial<Obj>>([exit, asked]);
			if (value instanceof Object) {
				obj = value;
			} else {
				return null;
			}
		}
		return obj as Obj;
	}
}
export { ObjectBuilder, Question, StringQuestion, SelectQuestion, ButtonQuestion, DisplayFunc, QuestionType };
