// File://home/rose/BOT/SuryaRB/Message/Features/upload.js
import Uploader from "../../Libs/Uploader.js";

export default {
	command: ["upload", "tourl"],
	description: "Upload a file",
	category: "Others",
	owner: false,
	group: false,
	admin: false,
	hidden: false,
	limit: false,
	private: false,

	haruna: async function (m, {}) {
		const q = m.quoted ? m.quoted : m;
		const mime = q.mtype || "";
		if (!/webp|image|video|webm/g.test(mime)) {
			return m.reply("Please reply/send an image with the command");
		}
		const media = await q.download();
		const buffer = Buffer.isBuffer(media) ? media : Buffer.from(media, "utf-8");
		const url = await Uploader.providers.quax.upload(buffer);
		m.reply(`*Url :* ${url}`);
	},
	failed: "Failed to haruna the %cmd command\n%error",
	wait: null,
	done: null,
};
