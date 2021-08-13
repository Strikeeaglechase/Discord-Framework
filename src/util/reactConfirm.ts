import { DiscordSendable, MessageChannel, toDiscordSendable } from "../app.js";
import Discord from "discord.js";
import { Sendable } from "../command.js";

type ConfirmOptions = Partial<{
	visual: boolean;
	onCancelMessage: Sendable;
	onConfirmMessage: Sendable;
	onConfirm: () => Sendable | Promise<Sendable>;
	onCancel: () => Sendable | Promise<Sendable>;
}>;

async function confirm(prompt: string, channel: MessageChannel, userId: string, opts: ConfirmOptions = {}) {
	const emb = new Discord.MessageEmbed();
	emb.setDescription(prompt);
	emb.setColor("#0096ff");
	emb.setTitle("Confirmation");
	emb.setFooter("You have 5 minutes to respond, after which this confirmation will automatically be denied.");
	let row = new Discord.MessageActionRow();
	const confirm = new Discord.MessageButton({ label: "Confirm", type: "BUTTON", customId: "confirm", style: "SUCCESS" });
	const cancel = new Discord.MessageButton({ label: "Cancel", type: "BUTTON", customId: "cancel", style: "DANGER" });
	row.addComponents(confirm, cancel);
	const message = await channel.send({ embeds: [emb], components: [row] });

	return new Promise<boolean>((res) => {
		const collector = message.createMessageComponentCollector({
			componentType: "BUTTON",
		});
		async function disable(accepted: boolean) {
			collector.stop();
			confirm.setDisabled(true);
			cancel.setDisabled(true);
			row = new Discord.MessageActionRow();
			row.addComponents(confirm, cancel);
			if (accepted) {
				emb.setColor("#00ff00");
				emb.setFooter("Action confirmed");
			} else {
				emb.setColor("#ff0000");
				emb.setFooter("Action canceled");
			}
			await message.edit({ embeds: [emb], components: [row] });
		}

		const timeout = setTimeout(async () => {
			await disable(false);
			res(false);
		}, 1000 * 60 * 5);

		collector.on("collect", async (collected) => {
			if (collected.user.id == userId) {
				let msgRes: DiscordSendable;
				let conf = collected.customId == "confirm";
				switch (collected.customId) {
					case "confirm":
						if (opts.onConfirmMessage) {
							msgRes = toDiscordSendable(opts.onConfirmMessage);
						} else if (opts.onConfirm) {
							msgRes = toDiscordSendable(await opts.onConfirm());
						} else {
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
						} else if (opts.onCancel) {
							msgRes = toDiscordSendable(await opts.onCancel());
						} else {
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
			} else {
				const err = new Discord.MessageEmbed({
					title: "Error",
					color: "#ff0000",
					description: "```diff\n- This command was not run by you. -\n```"
				});
				collected.reply({ embeds: [err], ephemeral: true });
			}
		});
		collector.on("end", (reason) => {
			clearTimeout(timeout);
		})
	});
}
export default confirm;
export { ConfirmOptions }