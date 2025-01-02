export default {
	command: ["join"],
	description: "Join a group using the invite link.",
	category: "Owner",
	owner: true,
	admin: false,
	hidden: false,
	limit: false,
	group: false,
	private: false,

	/**
	 * @param {import("../../Utils/Messages").ExtendedWAMessage} m - The message object.
	 * @param {import("../Handler").miscOptions} options - The options.
	 */
	haruna: async function (m, { sock, args, text }) {
		const regex = /https?:\/\/chat.whatsapp.com\/([a-zA-Z0-9_-]{22})/g;
		const match = regex.exec(text);
		if (!match) {
			return m.reply("Please send the group link");
		}

		const invite = match[1];
		const res = await sock.groupAcceptInvite(invite).catch(() => null);

		if (!res) {
			return m.reply("Failed to join the group");
		}
		m.reply("Successfully joined the group " + res);
	},
	failed: "Failed to haruna the %cmd command\n\n%error",
	wait: null,
	done: null,
};
