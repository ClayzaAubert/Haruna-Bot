import { Config } from "../config.js";

export default {
	command: ["allmenu"],
	description: "Show this menu",
	category: "Main",
	owner: false,
	admin: false,
	hidden: false,
	limit: false,
	group: false,
	private: false,

	haruna: async function (
		m,
		{ sock, text, usedPrefix, isOwner, isAdmin, feature }
	) {
		const c = text?.toLowerCase() ?? "";

		const features = feature;
		const filterded = Object.fromEntries(
			Object.entries(features).filter(([_, feature]) => !feature.hidden)
		);
		const plugins = Object.entries(filterded).reduce((acc, [key, value]) => {
			const category = value.category?.trim() || "Unknown";
			acc[category] = acc[category] || [];
			acc[category].push(value);
			return acc;
		}, {});
		const categories = Object.keys(plugins).sort();
		let message = "";
		for (const category of categories) {
			if (c && category?.toLowerCase() !== c) {
				continue;
			}
			message += `\n\`[ ${category} ]\`\n`;

			for (const plugin of plugins[category]) {
				const command = Array.isArray(plugin.customPrefix)
					? plugin.customPrefix[0]
					: plugin.customPrefix || Array.isArray(plugin.command)
						? usedPrefix + plugin.command[0]
						: usedPrefix + plugin.command;

				// command
				message +=
					((plugin.owner && !isOwner) || (plugin.admin && !isAdmin)
						? `~${command}~`
						: `${command}`) + "\n";

				// description
				message += `> ${plugin.description}\n`;

				// aliases
				const aliases =
					(Array.isArray(plugin.command) ? plugin.command.slice(1).join(", ") : null) ||
					null;
				if (aliases) {
					message += `> Aliases: ${aliases}\n`;
				}
			}
		}

		// if no command found for category
		if (!message && c) {
			message = `No command found for category \`${c}\``;
		}

		// send the message
		await sock.sendMessage(m.chat, {
			text: message.trim(),
			contextInfo: {
				externalAdReply: {
					title: Config.profile.namebot,
					body: Config.profile.powered,
					thumbnailUrl: Config.images.menu,
					sourceUrl: Config.profile.web,
					mediaType: 1,
					renderLargerThumbnail: true
				}
			}
		});
	},

	failed: "Failed to haruna the %cmd command\n%error",
	wait: null,
	done: null,
};
