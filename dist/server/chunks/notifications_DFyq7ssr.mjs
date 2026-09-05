import { n as db } from "./db_BJLNYA76.mjs";
//#region src/lib/notifications.ts
async function dispatchAlert(monitorName, target, status, details) {
	const channels = db.prepare("SELECT * FROM notification_channels WHERE active = 1").all();
	if (channels.length === 0) return;
	const title = status === "down" ? `🚨 [ALERT] ${monitorName} is DOWN` : `✅ [RECOVERY] ${monitorName} is BACK UP`;
	const description = status === "down" ? `Monitor ${monitorName} (${target}) failed.\nReason: ${details.errorMessage || `HTTP Status ${details.statusCode}` || "Connection failed"}` : `Monitor ${monitorName} (${target}) is responding normally.\nResponse time: ${details.responseTimeMs}ms`;
	for (const channel of channels) try {
		const config = JSON.parse(channel.config || "{}");
		if (channel.type === "webhook" && config.url) await fetch(config.url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				event: status === "down" ? "monitor.down" : "monitor.up",
				monitor: monitorName,
				target,
				status,
				...details,
				timestamp: (/* @__PURE__ */ new Date()).toISOString()
			})
		});
		else if (channel.type === "discord" && config.webhookUrl) {
			const color = status === "down" ? 15158332 : 3066993;
			await fetch(config.webhookUrl, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ embeds: [{
					title,
					description,
					color,
					fields: [
						{
							name: "Target",
							value: target,
							inline: true
						},
						{
							name: "Status",
							value: status.toUpperCase(),
							inline: true
						},
						...details.responseTimeMs ? [{
							name: "Latency",
							value: `${details.responseTimeMs}ms`,
							inline: true
						}] : [],
						...details.errorMessage ? [{
							name: "Error",
							value: details.errorMessage,
							inline: false
						}] : []
					],
					timestamp: (/* @__PURE__ */ new Date()).toISOString()
				}] })
			});
		} else if (channel.type === "telegram" && config.botToken && config.chatId) {
			const text = `*${title}*\n\nTarget: \`${target}\`\nStatus: *${status.toUpperCase()}*\n${details.errorMessage ? `Error: ${details.errorMessage}\n` : ""}${details.responseTimeMs ? `Latency: ${details.responseTimeMs}ms\n` : ""}Time: ${(/* @__PURE__ */ new Date()).toLocaleString()}`;
			await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					chat_id: config.chatId,
					text,
					parse_mode: "Markdown"
				})
			});
		} else if (channel.type === "slack" && config.webhookUrl) await fetch(config.webhookUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ text: `${title}\n${description}` })
		});
	} catch (err) {
		console.error(`Failed to send notification via ${channel.name} (${channel.type}):`, err);
	}
}
//#endregion
export { dispatchAlert as t };
