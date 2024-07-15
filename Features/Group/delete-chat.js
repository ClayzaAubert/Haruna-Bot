// File://home/rose/BOT/SuryaRB/Message/Features/delete-chat.js

export default {
	command: ["del", "delete"],
	description: "Delete message.",
	category: "Group",
	owner: false,
	admin: false,
	hidden: false,
	limit: false,
	group: false,
	private: false,

	/**
	 * @param {import("../../Utils/Messages").ExtendedWAMessage} m - The message object.
	 * @param {import("../Handler").miscOptions}
	 */
	haruna: async function (m, { isAdmin, isOwner, isBotAdmin }) {
		if (m.quoted) {
			if (m.isGroup && (isAdmin || isOwner) && isBotAdmin && !m.quoted.fromMe) {
				return m.quoted.delete();
			}
			m.quoted.delete();
		}
	},
	failed: "Failed to haruna the %cmd command\n%error",
	wait: null,
	done: null,
};
