export default {
	command: ["unban", "unbanned"],
	description: "unbanned user.",
	category: "Owner",
	owner: true,
	group: false,
	admin: false,
	hidden: false,
	limit: false,
	private: false,

	/**
	 * @param {import("../../Utils/Messages").ExtendedWAMessage} m - The message object.
	 * @param {import("../Handler").miscOptions} options - The options.
	 */
	haruna: async function (m, { sock, db }) {
		const _user = m?.quoted?.sender || m.mentionedJid[0];
		if (!_user) {
			return m.reply("Reply or tag a user");
		}
		const user = db.users.set(_user);
		user.banned = false;

		await sock.sendMessage(
			m.chat,
			{
				text: `Unbanned @${_user.replace(/[^0-9]/g, "")}`,
				mentions: [_user],
			},
			{ quoted: m }
		);
	},

	failed: "Failed to haruna the %cmd command\n%error",
	wait: null,
	done: null,
};
