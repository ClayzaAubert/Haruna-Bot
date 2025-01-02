export default {
	command: ["h", "hidetag"],
	description: "Annoying hidetag",
	category: "Group",
	owner: false,
	group: true,
	admin: true,
	hidden: false,
	limit: false,
	private: false,

	/**
	 * @param {import("../../Utils/Messages").ExtendedWAMessage} m - The message object.
	 * @param {import("../Handler").miscOptions} options - The options.
	 */
	haruna: async function (m, { sock, text, groupMetadata }) {
		const len = groupMetadata.participants.length;
		const mentions = [];
		for (let i = 0; i < len; i++) {
			const serialized = groupMetadata.participants[i].id.split("@")[0];
			mentions.push({
				tag: `@${serialized}\n`,
				mention: `${serialized}@s.whatsapp.net`,
			});
		}
		await sock.sendMessage(m.chat, {
			text: text || "",
			mentions: mentions.map((mention) => mention.mention),
		});
	},
	failed: "Failed to haruna the %cmd command\n%error",
	wait: null,
	done: null,
};
