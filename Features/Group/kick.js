export default {
	command: ["kick", "out"],
	description: "Kick member from group.",
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
	haruna: async function (m, { sock, isBotAdmin, groupMetadata }) {
		if (!isBotAdmin) {
			return m.reply("I'm not an admin");
		}

		const user = m?.quoted?.sender || m.mentionedJid[0];
		if (!user) {
			return m.reply("Reply or tag a user");
		}

		const groupAdmins = groupMetadata?.participants
			.filter((participant) => participant.admin)
			.map((participant) => participant.id);

		if (groupAdmins.includes(user)) {
			return m.reply("You can't kick an admin");
		}

		await sock.sendMessage(
			m.chat,
			{
				text: `Kicked @${user.replace(/[^0-9]/g, "")} from ${groupMetadata.subject}`,
				mentions: [user],
			},
			{ quoted: m }
		);

		await sock.groupParticipantsUpdate(m.chat, [user], "remove").catch(() => {});
	},

	failed: "Failed to haruna the %cmd command\n%error",
	wait: null,
	done: null,
};
