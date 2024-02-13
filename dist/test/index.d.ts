import { DynamicMessage, DynamicMessageManager } from "../dynamicMessage.js";
declare class App {
    value: number;
    dynamicMessageManager: DynamicMessageManager<TestDynamicMessage>;
    constructor(v: number);
}
declare class TestDynamicMessage extends DynamicMessage {
    onCreated(): Promise<void>;
    onTimedUpdate(): Promise<void>;
}
export { App };
