import Discord from "discord.js";
import FrameworkClient from "../app.js";
import { ButtonOption } from "./inputs/getButton.js";
import { SelectOption } from "./inputs/getDropdown.js";
declare enum QuestionType {
    str = 0,
    button = 1,
    select = 2
}
type P<T> = T | Promise<T>;
interface BaseQuestion {
    type: QuestionType;
    handle?: (value: string) => P<{
        passes: boolean;
        value: any;
    }>;
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
declare class ObjectBuilder<Obj> {
    private framework;
    private display;
    private message;
    private questions;
    constructor(framework: FrameworkClient, display: DisplayFunc, message: Discord.Message, questions: Question[]);
    private ask;
    askOneQuestion(obj: Obj): Promise<Partial<Obj>>;
    askAllQuestions(obj?: Partial<Obj>): Promise<Obj | null>;
}
export { ObjectBuilder, Question, StringQuestion, SelectQuestion, ButtonQuestion, DisplayFunc, QuestionType };
