export default {
	command: ["anoboy"],
	description: "Anoboy Information",
	category: "Anime",
	owner: false,
	admin: false,
	hidden: false,
	limit: false,
	group: false,
	private: false,

	haruna: async function (m, { sock, api, text }) {
		if (!text) return m.reply("Silakan berikan perintah yang benar: search, detail, atau episode.");

		const [action, ...query] = text.split(" ");
		const queryText = query.join(" ");

		try {
			if (action === "search") {
				const resSearch = await api.get("/anoboy/search", { q: queryText });

				if (resSearch.status === "Success" && resSearch.result.length > 0) {
					let replyText = `🔍 *Hasil Pencarian Anime di Anoboy*\n\n`;
					for (let item of resSearch.result) {
						replyText += `📚 *${item.title}*\n`;
						replyText += `URL: ${item.href}\n\n`;
					}
					m.reply(replyText);
				} else {
					await m.react("❌");
					m.reply("Tidak dapat menemukan hasil pencarian untuk kata kunci tersebut.");
				}
			} else if (action === "detail") {
				const resDetail = await api.get("/anoboy/detail", { url: queryText });

				if (resDetail.status === "Success" && resDetail.result.animeInfo) {
					let replyText = `📚 *Detail Anime*\n\n`;
					replyText += `Judul: ${resDetail.result.animeInfo.Judul}\n`;
					replyText += `Genre: ${resDetail.result.animeInfo.Genre}\n`;
					replyText += `Skor: ${resDetail.result.animeInfo.Score}\n\n`;

					replyText += `📺 *Daftar Episode*\n`;
					for (let episode of resDetail.result.episodeList) {
						replyText += `${episode.name} - [Tonton](${episode.link})\n`;
					}

					m.reply(replyText);
				} else {
					await m.react("❌");
					m.reply("Tidak dapat menemukan detail anime untuk URL tersebut.");
				}
			} else if (action === "episode") {
				const resEpisode = await api.get("/anoboy/episode", { url: queryText });

				if (resEpisode.status === "Success" && resEpisode.result.downloadLinks) {
					let replyText = `📚 *Link Episode*\n\n`;
					for (let link of resEpisode.result.downloadLinks) {
						replyText += `💾 *${link.title}*\n`;
						for (let quality of link.links) {
							replyText += `${quality.quality}: [Download](${quality.link})\n`;
						}
						replyText += "\n";
					}
					m.reply(replyText);
				} else {
					await m.react("❌");
					m.reply("Tidak dapat menemukan link episode untuk URL tersebut.");
				}
			} else {
				m.reply("Perintah tidak valid. Gunakan 'anoboy search [judul]', 'anoboy detail [URL]', atau 'anoboy episode [URL]'.");
			}
		} catch (e) {
			console.error(e);
			await m.react("❌");
			m.reply("Terjadi kesalahan saat memproses permintaan.");
		}
	},

	failed: "Gagal menjalankan perintah %cmd\n\n%error",
	wait: null,
	done: null,
};
