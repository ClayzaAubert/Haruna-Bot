import { exec } from "child_process";

export default {
	command: ["$"],
	customPrefix: ["$"],
	description: "Call shell commands",
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
	haruna: async function (m, { text }) {
		try {
			const result = await new Promise((resolve, reject) => {
				exec(text, (error, stdout, stderr) => {
					if (error) {
						reject(error);
					} else {
						resolve(stdout || stderr);
					}
				});
			});
			m.reply(`${result}`.trim());
		} catch (error) {
			m.reply(`${error}`.trim());
		}
	},
	failed: "Failed to haruna the %cmd command\n%error",
	wait: null,
	done: null,
};
