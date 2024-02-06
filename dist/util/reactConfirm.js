import Discord, { ButtonStyle, ComponentType, EmbedBuilder } from "discord.js";
import { toDiscordSendable } from "../app.js";
async function confirm(prompt, channel, userId, opts = {}) {
    const emb = new Discord.EmbedBuilder();
    emb.setDescription(prompt);
    emb.setColor("#0096ff");
    emb.setTitle("Confirmation");
    emb.setFooter({ text: "You have 5 minutes to respond, after which this confirmation will automatically be denied." });
    let row = new Discord.ActionRowBuilder();
    const confirm = new Discord.ButtonBuilder({ label: "Confirm", customId: "confirm", style: ButtonStyle.Success });
    const cancel = new Discord.ButtonBuilder({ label: "Cancel", customId: "cancel", style: ButtonStyle.Danger });
    row.addComponents(confirm, cancel);
    const message = await channel.send({ embeds: [emb], components: [row] });
    return new Promise(res => {
        const collector = message.createMessageComponentCollector({
            componentType: ComponentType.Button
        });
        async function disable(accepted) {
            collector.stop();
            confirm.setDisabled(true);
            cancel.setDisabled(true);
            row = new Discord.ActionRowBuilder();
            row.addComponents(confirm, cancel);
            if (accepted) {
                emb.setColor("#00ff00");
                emb.setFooter({ text: "Action confirmed" });
            }
            else {
                emb.setColor("#ff0000");
                emb.setFooter({ text: "Action canceled" });
            }
            await message.edit({ embeds: [emb], components: [row] });
        }
        const timeout = setTimeout(async () => {
            await disable(false);
            res(false);
        }, 1000 * 60 * 5);
        collector.on("collect", async (collected) => {
            if (collected.user.id == userId) {
                let msgRes;
                let conf = collected.customId == "confirm";
                switch (collected.customId) {
                    case "confirm":
                        if (opts.onConfirmMessage) {
                            msgRes = toDiscordSendable(opts.onConfirmMessage);
                        }
                        else if (opts.onConfirm) {
                            msgRes = toDiscordSendable(await opts.onConfirm());
                        }
                        else {
                            msgRes = {
                                embeds: [
                                    new EmbedBuilder({
                                        description: `\`\`\`diff\n+ Action confirmed +\`\`\``
                                    })
                                ]
                            };
                        }
                        break;
                    case "cancel":
                        if (opts.onCancelMessage) {
                            msgRes = toDiscordSendable(opts.onCancelMessage);
                        }
                        else if (opts.onCancel) {
                            msgRes = toDiscordSendable(await opts.onCancel());
                        }
                        else {
                            msgRes = {
                                embeds: [
                                    new EmbedBuilder({
                                        description: `\`\`\`diff\n- Action canceled -\n\`\`\``
                                    })
                                ]
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
                const err = new Discord.EmbedBuilder({
                    title: "Error",
                    color: 0xff0000,
                    description: "```diff\n- This command was not run by you. -\n```"
                });
                collected.reply({ embeds: [err], ephemeral: true });
            }
        });
        collector.on("end", reason => {
            clearTimeout(timeout);
        });
    });
}
export default confirm;
