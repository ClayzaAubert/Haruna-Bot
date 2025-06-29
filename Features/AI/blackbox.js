export default {
	command: ["blackbox"],
	description: "Chat, Chat + Reply Image, or Generate Image using Blackbox AI",
	category: "AI",
	owner: false,
	admin: false,
	hidden: false,
	limit: false,
	group: false,
	private: false,

	haruna: async (m, { sock, api, text, cdn }) => {
		try {
			// === Imagine Mode ===
			if (text?.startsWith("/imagine")) {
				const prompt = text.replace("/imagine", "").trim();

				if (!prompt) {
					return m.reply("Please provide a description for the image using `/imagine <description>`.");
				}

				await m.reply("🎨 Generating image...");
				const res = await api.get("/blackbox/imagine", { prompt });

				return sock.sendMessage(
					m.chat,
					{ image: { url: res.result.url }, caption: `*_${res.powered}_*` },
					{ quoted: m }
				);
			}

			// === Image Analysis Mode ===
			const q = m.quoted || m;
			const mime = q.message?.mimetype || "";
			const isImage = /webp|image/.test(mime) || ["imageMessage", "stickerMessage"].includes(q.mtype);

			if (isImage) {
				const media = await q.download();
				const url = await cdn.maelyn(media);

				await m.reply("🧠 Processing image...");
				const res = await api.get("/blackbox/image", { url: url, q: text });

				return sock.sendMessage(
					m.chat,
					{ image: { url: url }, caption: res.result },
					{ quoted: m }
				);
			}

			// === Chat Mode ===
			if (!text) {
				return m.reply(
					"Please provide a text query. Usage:\n" +
					"- `/imagine <description>`: Generate an image based on a description.\n" +
					"- Reply to an image with a query: Analyze the image.\n" +
					"- `<text>`: Chat with the AI."
				);
			}

			await m.reply("💬 Processing text...");
			const res = await api.get("/blackbox/chat", { q: text });

			return sock.sendMessage(
				m.chat,
				{ text: res.result },
				{ quoted: m }
			);

		} catch (err) {
			console.error("Blackbox error:", err);
			m.reply("❌ Failed to process the command. Please try again later.");
		}
	},

	failed: "Failed to haruna the %cmd command\n\n%error",
	wait: null,
	done: null,
};
