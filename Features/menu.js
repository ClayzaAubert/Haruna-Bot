import { Config } from "../config.js";

export default {
	command: ["menu"],
	description: "Show available menu categories or commands by category",
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
		try {
			const categoryFilter = (text || "").toLowerCase().trim();
			const features = feature;

			const availableCategories = new Set();
			Object.values(features).forEach((plugin) => {
				if (plugin.category) {
					availableCategories.add(plugin.category.trim().toLowerCase());
				}
			});

			if (!categoryFilter) {
				let categoryList = "> *List Category Menu :*\n";
				Array.from(availableCategories).forEach((category) => {
					categoryList += `- ${usedPrefix}menu ${category}\n`;
				});
				await sock.sendMessage(m.chat, {
					text: categoryList,
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
				return;
			}

			const filteredFeatures = Object.values(features).filter((plugin) => {
				const pluginCategory = (plugin.category || "").toLowerCase().trim();
				return pluginCategory === categoryFilter;
			});

			if (filteredFeatures.length === 0) {
				await sock.sendMessage(m.chat, { text: `No commands found for category \`${categoryFilter}\`` });
				return;
			}

			let message = "";
			for (const plugin of filteredFeatures) {
				const command = Array.isArray(plugin.customPrefix)
					? plugin.customPrefix[0]
					: plugin.customPrefix || Array.isArray(plugin.command)
						? usedPrefix + plugin.command[0]
						: usedPrefix + plugin.command;

				message +=
					((plugin.owner && !isOwner) || (plugin.admin && !isAdmin)
						? `~${command}~`
						: `${command}`) + "\n";

				message += `> ${plugin.description}\n`;

				const aliases =
					(Array.isArray(plugin.command) ? plugin.command.slice(1).join(", ") : null) ||
					null;
				if (aliases) {
					message += `> Aliases: ${aliases}\n`;
				}
			}

			await sock.sendMessage(m.chat, {
				text: message.trim(),
				contextInfo: {
					externalAdReply: {
						title: Config.profile.namebot,
						body: Config.profile.powered,
						thumbnailUrl: Config.images.allmenu,
						sourceUrl: Config.profile.web,
						mediaType: 1,
						renderLargerThumbnail: true
					}
				}
			});
		} catch (error) {
			await sock.sendMessage(m.chat, { text: `Failed to haruna the command\n${error.message}` });
		}
	},

	failed: "Failed to haruna the %cmd command\n%error",
	wait: null,
	done: null,
};
