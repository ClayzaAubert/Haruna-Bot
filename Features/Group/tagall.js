// File://home/rose/BOT/SuryaRB/Message/Features/tagall.js
export default {
	command: ["tagall", "everyone"],
	description: "Tag all members.",
	category: "Group",
	owner: false,
	group: true,
	admin: true,
	hidden: false,
	limit: false,
	private: false,

	haruna: async function (m, { sock, groupMetadata }) {
		const len = groupMetadata.participants.length;
		const mentions = [];
		for (let i = 0; i < len; i++) {
			const serialized = groupMetadata.participants[i].id.split("@")[0];
			mentions.push({
				tag: `@${serialized}\n`,
				mention: `${serialized}@s.whatsapp.net`,
			});
		}
		const messageText = mentions.map((mention) => mention.tag).join("");
		sock.sendMessage(m.chat, {
			text: messageText,
			mentions: mentions.map((mention) => mention.mention),
		});
	},
	failed: "Failed to haruna the %cmd command\n%error",
	wait: null,
	done: null,
};
