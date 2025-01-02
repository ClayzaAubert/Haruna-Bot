import axios from "axios";

export default {
	command: ["=>"],
	customPrefix: ["=>"],
	description: "Evaluate a JavaScript code",
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
	haruna: async function (m, { text, args, sock, api, feature, db }) {
		const str = `async function run() {  ${text} }; run();`;
		try {
			let result = await eval(str);
			if (typeof result === "object") {
				result = JSON.stringify(result, null, 2);
			}
			m.reply(`${result}`.trim());
		} catch (error) {
			m.reply(`Error: ${error.message}`);
		}
	},
	failed: "Failed to haruna the %cmd command\n%error",
	wait: null,
	done: null,
};
