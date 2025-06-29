// File://home/rose/BOT/SuryaRB/Message/Features/save-file.js
import { writeFileSync } from "fs";

export default {
	command: ["sf", "savefile"],
	description: "Save file.",
	category: "Owner",
	owner: true,
	admin: false,
	hidden: false,
	limit: false,
	group: false,
	private: false,

	haruna: async function (m, { sock, usedPrefix, command, text }) {
		if (!text) {
			return m.reply(
				`Where is the path?\n${usedPrefix + command} Features/icikiwir.js`
			);
		}
		if (!m.quoted.message) return m.reply("Reply code.");
		const path = text;
		await writeFileSync(path, m.quoted.message);
		m.reply(`Saved ${path} to file.`);
	},
	failed: "Failed to haruna the %cmd command\n%error",
	wait: null,
	done: null,
};
