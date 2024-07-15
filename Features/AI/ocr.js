import Uploader from "../../Libs/Uploader.js";

export default {
	command: ["ocr"],
	description: "Optical character recognition.",
	category: "AI",
	owner: false,
	admin: false,
	hidden: false,
	limit: false,
	group: false,
	private: false,

	haruna: async function (m, { sock, api }) {
		const q = m.quoted ? m.quoted : m;
		const mime = q.mtype || "";

		if (!mime.startsWith("image/")) {
			return m.reply("Please reply/send an image with the command");
		}

		const media = await q.download();
		const buffer = Buffer.isBuffer(media) ? media : Buffer.from(media, "utf-8");
		const url = await Uploader.providers.telegraph.upload(buffer);

		try {
            const response = await api.get("/api/ocr", { url: url });

			if (response) {
				const result = response.result;
				await sock.sendMessage(m.chat, { text: result }, { quoted: m });
			} else {
				throw new Error("Failed to fetch OCR result. No data returned.");
			}
		} catch (error) {
			console.error("Error fetching OCR result:", error);
			await m.reply("Failed to fetch OCR result. Please try again later.");
		}
	},
	failed: "Failed to haruna the %cmd command\n%error",
	wait: ["Please wait %tag", "Hold on %tag, fetching response"],
	done: null,
};
