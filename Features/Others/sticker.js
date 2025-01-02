// File:///home/rose/BOT/SuryaRB/Message/Features/sticker.js
import Sticker from "../../Libs/Sticker.js";

export default {
	command: ["sticker", "stiker", "s"],
	description: "Create a sticker",
	category: "Others",
	owner: false,
	group: false,
	admin: false,
	hidden: false,
	limit: false,
	private: false,

	// we are know all of the parameters from the handler
	haruna: async function (m, { sock }) {
		const q = m.quoted ? m.quoted : m;
		const mime = q.mtype || "";
		if (!/sticker|webp|image|video|webm/g.test(mime)) {
			console.log(mime);
			return m.reply("Please reply/send a image with the command");
		}
		const image = await q.download();
		const sticker = await Sticker.create(image, {
			packname: "Kurodate Haruna",
			author: "Clayza Aubert",
			emojis: "💢",
		});
		await sock.sendMessage(m.chat, { sticker: sticker }, { quoted: m });
	},
	failed: "Failed to haruna the %cmd command\n%error",
	wait: null,
	done: null,
};
