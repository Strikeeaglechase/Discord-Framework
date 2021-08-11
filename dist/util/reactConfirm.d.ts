import { MessageChannel } from "../app.js";
import { Sendable } from "../command.js";
declare type ConfirmOptions = Partial<{
    visual: boolean;
    onCancelMessage: Sendable;
    onConfirmMessage: Sendable;
    onConfirm: () => Sendable | Promise<Sendable>;
    onCancel: () => Sendable | Promise<Sendable>;
}>;
declare function confirm(prompt: string, channel: MessageChannel, userId: string, opts?: ConfirmOptions): Promise<boolean>;
export default confirm;
export { ConfirmOptions };
