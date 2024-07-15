export default {
	command: ["setting"],
	description: "Set the bot settings.",
	category: "Owner",
	owner: true,
	admin: false,
	hidden: false,
	limit: false,
	group: false,
	private: false,
	
	haruna: async function (m, { sock, args, db }) {
		const setting = db.settings.set(sock.user.id);
		const [key, value] = args;
		if (!key || (!key) in setting) {
			return m.reply(
				`The available settings are: ${Object.keys(setting).join(", ")}`
			);
		}
		// any value -> Boolean
		setting[key] = value === "true" ? true : value === "false" ? false : value;
		return m.reply(`The ${key} setting has been changed to ${value}`);
	},
	failed: "Failed to haruna the %cmd command\n\n%error",
	wait: null,
	done: null,
};
