import { Message } from "discord.js";
import FrameworkClient from "./app.js";
interface DynamicMessageRef<CData = {}> {
    guildId: string;
    channelId: string;
    messageId: string;
    lastUpdated: number;
    data: CData;
    type: string;
}
type DynamicMessageCtor<T extends DynamicMessage<CData>, CData = {}> = new (manager: DynamicMessageManager<T, CData>, ref: DynamicMessageRef<CData>, message: Message) => T;
declare abstract class DynamicMessage<CData = {}> {
    protected manager: DynamicMessageManager<DynamicMessage<CData>, CData>;
    ref: DynamicMessageRef<CData>;
    message: Message;
    data: CData;
    constructor(manager: DynamicMessageManager<DynamicMessage<CData>, CData>, ref: DynamicMessageRef<CData>, message: Message);
    onCreated(): Promise<void>;
    onLoaded(): Promise<void>;
    onTimedUpdate(): Promise<void>;
    delete(): Promise<void>;
}
interface DMMOptions {
    timedUpdateInterval: number;
    maxPerChannel: number;
    maxPerGuild: number;
}
declare class DynamicMessageManager<T extends DynamicMessage<CData>, CData = {}> {
    framework: FrameworkClient;
    private ctor;
    private options;
    constructor(framework: FrameworkClient, ctor: DynamicMessageCtor<T>, options?: Partial<DMMOptions>);
    messages: T[];
    load(): Promise<void>;
    private updateLoop;
    create(message: Message, data?: CData): Promise<T>;
}
export { DynamicMessage, DynamicMessageRef, DynamicMessageManager };
