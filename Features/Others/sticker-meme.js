import axios from "axios";
import Uploader from "../../Libs/Uploader.js";
import Sticker from "../../Libs/Sticker.js";

export default {
	command: ["smeme", "stickermeme"],
	description: "Create sticker meme.",
	category: "Others",
	owner: false,
	admin: false,
	hidden: false,
	limit: false,
	group: false,
	private: false,

	haruna: async function (m, { sock, api, args, usedPrefix, command }) {
		const q = m.quoted ? m.quoted : m;
		const mime = q.mtype || "";
		if (!mime.includes("image")) {
			return m.reply(`Reply or send an image with caption *${usedPrefix + command}*`);
		}
		const [teks1 = "", teks2 = ""] = args.join(" ").split("|").map((text) => text.trim());
		const media = await q.download();
		const buffer = Buffer.isBuffer(media) ? media : Buffer.from(media, "utf-8");
		const url = await Uploader.providers.tmpfiles.upload(buffer);

		try {
			const memeApiUrl = `https://api.memegen.link/images/custom/${encodeURIComponent(teks1)}/${encodeURIComponent(teks2)}.png?background=${url}`;
			const response = await axios.get(memeApiUrl, { responseType: "arraybuffer" });

			const sticker = await Sticker.create(response.data, {
				packname: "Kurodate Haruna",
				author: "Clayza Aubert",
				emojis: "💢",
			});
			await sock.sendMessage(m.chat, { sticker: sticker }, { quoted: m });
		} catch (e) {
			console.error("Error creating sticker meme:", e);
			await m.reply("Failed to create sticker meme. Please try again later.");
		}
	},
	failed: "Failed to execute the %cmd command\n%error",
	wait: null,
	done: null,
};
