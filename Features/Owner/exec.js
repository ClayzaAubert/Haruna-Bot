import util from "util";

export default {
	command: ["=>"],
	customPrefix: ["=>"],
	description: "Evaluate JavaScript code",
	category: "Owner",
	owner: true,
	admin: false,
	hidden: false,
	limit: false,
	group: false,
	private: false,

	/**
	 * @param {import("../../Utils/Messages").ExtendedWAMessage} m
	 * @param {import("../Handler").miscOptions} options
	 */
	haruna: async function (m, { text, args, sock, api, cdn, feature, db }) {
		try {
			let result = await eval(`(async () => { return ${text} })()`); // << ganti jadi return agar bisa console log objek
			if (typeof result !== "string") {
				result = util.inspect(result, { depth: 2 });
			}
			m.reply(result.trim());
		} catch (err) {
			m.reply("❌ *Error:*\n" + err.stack);
		}
	}
};
