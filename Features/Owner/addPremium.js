export default {
	command: ["addprem", "addpremium"],
	description: "Add premium user.",
	category: "Owner",
	owner: true,
	group: false,
	admin: false,
	hidden: false,
	limit: false,
	private: false,

	haruna: async function (m, { sock, args, db }) {
		let [user, expired] = args;
		if (!user) {
			return m.reply("tag a user");
		} else if (!expired || isNaN(expired)) {
			return m.reply("expired time not found/invalid");
		}
		user = user.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

		const user_exist = db.users.get(user);
		if (!user_exist) {
			return m.reply(`User ${user} not ~found~`);
		}

		const expired_time = Date.now() + expired * 86400000;
		user_exist.premium = true;

		// if user has premium, add the expired time to the current expired time
		if (user_exist.premium_expired) {
			user_exist.premium_expired += expired * 86400000;
		} else {
			user_exist.premium_expired = expired_time;
		}

		const readablePremium = new Date(user_exist.premium_expired).toLocaleString(
			"en-US",
			{
				// change timezone to your timezone
				timeZone: "Asia/Jakarta",
			}
		);

		const text = `Added premium user @${user.replace(/[^0-9]/g, "")} for ${expired} days\nExpired at ${readablePremium}`;

		await sock.sendMessage(
			m.chat,
			{
				text,
				mentions: [user],
				mimetype,
			},
			{ quoted: m }
		);
	},

	failed: "Failed to haruna the %cmd command\n%error",
	wait: null,
	done: null,
};
