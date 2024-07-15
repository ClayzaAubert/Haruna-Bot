export default {
	command: ["samehadaku"],
	description: "Samehadaku Information",
	category: "Anime",
	owner: false,
	admin: false,
	hidden: false,
	limit: false,
	group: false,
	private: false,

	haruna: async function (m, { sock, api, text }) {
		if (!text) return m.reply("Silakan berikan perintah yang benar: search, detail, download, atau lastupdate.");

		const [action, ...query] = text.split(" ");
		const queryText = query.join(" ");

		try {
			if (action === "search") {
				const res = await api.get("/api/samehadaku/search", { q: queryText });

				if (res.status === "Success" && res.result.length > 0) {
					let replyText = `Hasil pencarian untuk "${queryText}":\n\n`;
					for (let item of res.result) {
						replyText += `📚 *${item.title}*\n`;
						replyText += `Tipe: ${item.type}\n`;
						replyText += `Skor: ${item.score}\n`;
						replyText += `Genre: ${item.genres.join(", ")}\n`;
						replyText += `URL: ${item.link}\n\n`;
					}
					m.reply(replyText);
				} else {
					await m.react("❌");
					m.reply("Tidak dapat menemukan hasil pencarian.");
				}
			} else if (action === "detail") {
				const res = await api.get("/api/samehadaku/detail", { url: queryText });

				if (res.status === "Success" && res.result) {
					let info = res.result.details;
					let episodes = res.result.episodes.map(ep => 
						`📖 *${ep.Title}* - [Tonton](${ep.Link})\n`
					).join("");

					let replyText = `📚 *Detail Anime*\n`;
					replyText += `Judul: ${res.result.title}\n`;
					replyText += `Rating: ${res.result.rating}\n`;
					replyText += `Deskripsi: ${res.result.description}\n`;
					replyText += `Genre: ${res.result.genres.join(", ")}\n\n`;
					replyText += `📖 *Info Detail*\n`;
					replyText += `Japanese: ${info.Japanese}\n`;
					replyText += `Status: ${info.Status}\n`;
					replyText += `Tipe: ${info.Type}\n`;
					replyText += `Sumber: ${info.Source}\n`;
					replyText += `Durasi: ${info.Duration}\n`;
					replyText += `Total Episode: ${info.TotalEpisode}\n`;
					replyText += `Rilis: ${info.Released}\n\n`;
					replyText += `📖 *Episodes*\n${episodes}`;
					m.reply(replyText);
				} else {
					await m.react("❌");
					m.reply("Tidak dapat menemukan detail untuk URL tersebut.");
				}
			} else if (action === "download") {
				const res = await api.get("/api/samehadaku/download", { url: queryText });

				if (res.status === "Success" && res.result.links.length > 0) {
					let replyText = `📚 *Link Download*\n\n`;
					for (let item of res.result.links) {
						replyText += `Kualitas: ${item.quality}\n`;
						replyText += `Sumber: ${item.linkText}\n`;
						replyText += `URL: [Download](${item.linkUrl})\n\n`;
					}
					m.reply(replyText);
				} else {
					await m.react("❌");
					m.reply("Tidak dapat menemukan link download.");
				}
			} else if (action === "lastupdate") {
				const res = await api.get("/api/samehadaku/lastupdate");

				if (res.status === "Success" && res.result.length > 0) {
					let replyText = `📚 *Update Terbaru*\n\n`;
					for (let item of res.result) {
						replyText += `📚 *${item.title}*\n`;
						replyText += `Episode: ${item.episode}\n`;
						replyText += `URL: ${item.link}\n`;
						replyText += `Rilis: ${item.releaseTime}\n\n`;
					}
					m.reply(replyText);
				} else {
					await m.react("❌");
					m.reply("Tidak ada update terbaru.");
				}
			} else {
				m.reply("Perintah tidak valid. Gunakan 'samehadaku search [judul]', 'samehadaku detail [URL]', 'samehadaku download [URL]', atau 'samehadaku lastupdate'.");
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
