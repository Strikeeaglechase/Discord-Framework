var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { toDiscordSendable } from "../app.js";
import Discord from "discord.js";
function confirm(prompt, channel, userId, opts = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const emb = new Discord.MessageEmbed();
        emb.setDescription(prompt);
        emb.setColor("#0096ff");
        emb.setTitle("Confirmation");
        emb.setFooter("You have 5 minutes to respond, after which this confirmation will automatically be denied.");
        let row = new Discord.MessageActionRow();
        const confirm = new Discord.MessageButton({ label: "Confirm", type: "BUTTON", customId: "confirm", style: "SUCCESS" });
        const cancel = new Discord.MessageButton({ label: "Cancel", type: "BUTTON", customId: "cancel", style: "DANGER" });
        row.addComponents(confirm, cancel);
        const message = yield channel.send({ embeds: [emb], components: [row] });
        return new Promise((res) => {
            const collector = message.createMessageComponentCollector({
                componentType: "BUTTON",
            });
            function disable(accepted) {
                return __awaiter(this, void 0, void 0, function* () {
                    collector.stop();
                    confirm.setDisabled(true);
                    cancel.setDisabled(true);
                    row = new Discord.MessageActionRow();
                    row.addComponents(confirm, cancel);
                    if (accepted) {
                        emb.setColor("#00ff00");
                        emb.setFooter("Action confirmed");
                    }
                    else {
                        emb.setColor("#ff0000");
                        emb.setFooter("Action canceled");
                    }
                    yield message.edit({ embeds: [emb], components: [row] });
                });
            }
            const timeout = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                yield disable(false);
                res(false);
            }), 1000 * 60 * 5);
            collector.on("collect", (collected) => __awaiter(this, void 0, void 0, function* () {
                if (collected.user.id == userId) {
                    let msgRes;
                    let conf = collected.customId == "confirm";
                    switch (collected.customId) {
                        case "confirm":
                            if (opts.onConfirmMessage) {
                                msgRes = toDiscordSendable(opts.onConfirmMessage);
                            }
                            else if (opts.onConfirm) {
                                msgRes = toDiscordSendable(yield opts.onConfirm());
                            }
                            else {
                                msgRes = {
                                    embeds: [{
                                            description: `\`\`\`diff\n+ Action confirmed +\`\`\``
                                        }],
                                };
                            }
                            break;
                        case "cancel":
                            if (opts.onCancelMessage) {
                                msgRes = toDiscordSendable(opts.onCancelMessage);
                            }
                            else if (opts.onCancel) {
                                msgRes = toDiscordSendable(yield opts.onCancel());
                            }
                            else {
                                msgRes = {
                                    embeds: [{
                                            description: `\`\`\`diff\n- Action canceled -\n\`\`\``
                                        }]
                                };
                            }
                            break;
                    }
                    msgRes.ephemeral = !opts.visual;
                    collected.reply(msgRes);
                    disable(conf);
                    res(conf);
                }
                else {
                    const err = new Discord.MessageEmbed({
                        title: "Error",
                        color: "#ff0000",
                        description: "```diff\n- This command was not run by you. -\n```"
                    });
                    collected.reply({ embeds: [err], ephemeral: true });
                }
            }));
            collector.on("end", (reason) => {
                clearTimeout(timeout);
            });
        });
    });
}
export default confirm;
