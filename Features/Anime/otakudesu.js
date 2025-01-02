export default {
	command: ["otakudesu"],
	description: "Otakudesu Information",
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
				const res = await api.get("/otakudesu/search", { q: queryText });

				if (res.status === "Success" && res.result.length > 0) {
					let replyText = `Hasil pencarian untuk "${queryText}":\n\n`;
					for (let item of res.result) {
						replyText += `📚 *${item.judul}*\n`;
						replyText += `URL: ${item.link}\n\n`;
					}
					m.reply(replyText);
				} else {
					await m.react("❌");
					m.reply("Tidak dapat menemukan hasil pencarian.");
				}
			} else if (action === "detail") {
				const res = await api.get("/otakudesu/detail", { url: queryText });

				if (res.status === "Success" && res.result) {
					let info = res.result.info;
					let episodes = res.result.epsd_url.map(ep => 
						`📖 *${ep.title}* - [Tonton](${ep.epsd_url})\n`
					).join("");

					let replyText = `📚 *Detail Anime*\n`;
					replyText += `Judul: ${info.judul}\n`;
					replyText += `Japanese: ${info.japanese}\n`;
					replyText += `Rating: ${info.rating}\n`;
					replyText += `Produser: ${info.produser}\n`;
					replyText += `Tipe: ${info.tipe}\n`;
					replyText += `Status: ${info.anime_status}\n`;
					replyText += `Total Episode: ${info.total_episode}\n`;
					replyText += `Durasi: ${info.durasi}\n`;
					replyText += `Rilis: ${info.rilis}\n`;
					replyText += `Studio: ${info.studio}\n`;
					replyText += `Genre: ${info.genre}\n`;
					replyText += `Sinopsis: ${info.sinopsis}\n\n`;
					replyText += `📖 *Episodes*\n${episodes}`;
					m.reply(replyText);
				} else {
					await m.react("❌");
					m.reply("Tidak dapat menemukan detail untuk URL tersebut.");
				}
			} else if (action === "download") {
				const res = await api.get("/otakudesu/download", { url: queryText });

				if (res.status === "Success" && res.result.length > 0) {
					let replyText = `📚 *Link Download*\n\n`;
					for (let item of res.result) {
						replyText += `Resolusi: ${item.resolusi}\n`;
						replyText += `Sumber: ${item.sumber}\n`;
						replyText += `URL: [Download](${item.dl_url})\n\n`;
					}
					m.reply(replyText);
				} else {
					await m.react("❌");
					m.reply("Tidak dapat menemukan link download.");
				}
			} else if (action === "lastupdate") {
				const res = await api.get("/otakudesu/lastupdate");

				if (res.status === "Success" && res.result.length > 0) {
					let replyText = `📚 *Update Terbaru*\n\n`;
					for (let item of res.result) {
						replyText += `📚 *${item.judul}*\n`;
						replyText += `Episode: ${item.episode}\n`;
						replyText += `Tanggal: ${item.tanggal}\n`;
						replyText += `Hari: ${item.hari}\n`;
						replyText += `URL: ${item.link}\n\n`;
					}
					m.reply(replyText);
				} else {
					await m.react("❌");
					m.reply("Tidak ada update terbaru.");
				}
			} else {
				m.reply("Perintah tidak valid. Gunakan 'otakudesu search [judul]', 'otakudesu detail [URL]', 'otakudesu download [judul]', atau 'otakudesu lastupdate'.");
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
