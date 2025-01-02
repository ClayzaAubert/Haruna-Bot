import Uploader from "../../Libs/Uploader.js";

export default {
	command: ["esrgan"],
	description: "Image To HD",
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
		const url = await Uploader.providers.quax.upload(buffer);

		try {
            const response = await api.get("/esrgan", { url: url });

			if (response.status === "Success") {
				const res = response;
				await sock.sendMessage(
                    m.chat,
                    { image: { url: res.result.url }, caption: `*_${res.powered}_*` },
                    { quoted: m }
                );
			} else {
				throw new Error(`Failed to fetch esrgan result. Status: ${response.status}`);
			}
		} catch (error) {
			console.error("Error fetching esrgan result:", error);
			await m.reply("Failed to fetch esrgan result. Please try again later.");
		}
	},
	failed: "Failed to execute the %cmd command\n%error",
	wait: ["Please wait %tag", "Hold on %tag, fetching response"],
	done: null,
};
