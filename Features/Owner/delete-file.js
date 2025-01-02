// File://home/rose/BOT/SuryaRB/Message/Features/delete-file.js
import fs from "fs";
import path from "path";

export default {
	command: ["df", "deletefile"],
	description: "Delete file.",
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
				`Where is the path?\n${usedPrefix + command} Message/Features/icikiwir.js`
			);
		}
		const filePath = path.join(process.cwd(), text);
		if (!fs.existsSync(filePath)) {
			return m.reply("Sorry, the file or folder in question was not found.");
		}
		if (fs.statSync(filePath).isDirectory()) {
			fs.rmdirSync(filePath, { recursive: true });
		} else {
			fs.unlinkSync(filePath);
		}

		m.reply(`Successfully delete ${text}`);
	},
	failed: "Failed to haruna the %cmd command\n%error",
	wait: null,
	done: null,
};
