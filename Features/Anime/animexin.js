export default {
	command: ["animexin"],
	description: "Animexin Information Donghua.",
	category: "Anime",
	owner: false,
	admin: false,
	hidden: false,
	limit: false,
	group: false,
	private: false,

	haruna: async function (m, { sock, api, text }) {
		if (!text) return m.reply("Silakan berikan perintah yang benar: stream, populer, atau lastupdate.");

		const [action, ...query] = text.split(" ");
		const queryText = query.join(" ");

		try {
			if (action === "stream") {
				const resStream = await api.get("/api/animexin/stream", { url: queryText });

				if (resStream.status === "Success" && resStream.result) {
					let mirrors = resStream.result.mirrors.map(mirror => 
						`📺 *${mirror.name}* - [Tonton](${mirror.link})\n`
					).join("");

					let replyText = `📚 *Streaming Anime*\n\n`;
					replyText += `Judul: ${resStream.result.title}\n`;
					replyText += `Tanggal Rilis: ${resStream.result.releaseDate}\n\n`;
					replyText += `📺 *Mirrors*\n${mirrors}`;
					m.reply(replyText);
				} else {
					await m.react("❌");
					m.reply("Tidak dapat menemukan link streaming untuk URL tersebut.");
				}
			} else if (action === "populer") {
				const resPopuler = await api.get("/api/animexin/populer");

				if (resPopuler.status === "Success" && resPopuler.result.length > 0) {
					let replyText = `📚 *Anime Populer*\n\n`;
					for (let item of resPopuler.result) {
						replyText += `📚 *${item.title}*\n`;
						replyText += `URL: ${item.url}\n\n`;
					}
					m.reply(replyText);
				} else {
					await m.react("❌");
					m.reply("Tidak dapat menemukan anime populer.");
				}
			} else if (action === "lastupdate") {
				const resLastUpdate = await api.get("/api/animexin/lastupdate");

				if (resLastUpdate.status === "Success" && resLastUpdate.result.length > 0) {
					let replyText = `📚 *Update Terbaru*\n\n`;
					for (let item of resLastUpdate.result) {
						replyText += `📚 *${item.title}*\n`;
						replyText += `URL: ${item.link}\n\n`;
					}
					m.reply(replyText);
				} else {
					await m.react("❌");
					m.reply("Tidak ada update terbaru.");
				}
			} else {
				m.reply("Perintah tidak valid. Gunakan 'animexin stream [URL]', 'animexin populer', atau 'animexin lastupdate'.");
			}
		} catch (e) {
			console.error(e);
			await m.react("❌");
			m.reply("Terjadi kesalahan saat memproses permintaan.");
		}
	},

	failed: "Failed to execute the %cmd command\n\n%error",
	wait: null,
	done: null,
};
