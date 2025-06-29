export default {
	command: ["afk"],
	description: "AFK Status.",
	category: "Group",
	owner: false,
	group: true,
	admin: false,
	hidden: false,
	limit: false,
	private: false,

	haruna: async function (m, { db, text }) {
		const user = db.users.set(m.sender); // pastikan ambil dari db

		// Set AFK
		user.afk = {
			status: true,
			reason: text || "", // alasan afk
			time: Date.now(),
		};

		m.reply(
			`${await m.getName(m.sender)} is now AFK${
				text ? `\n> *Alasan* : ${text}` : ""
			}`
		);
	},

	failed: "Failed to haruna the %cmd command\n%error",
	wait: null,
	done: null,
};