export default {
	command: ["shinigami"],
	description: "Shinigami Informations",
	category: "Comic",
	owner: false,
	admin: false,
	hidden: false,
	limit: false,
	group: false,
	private: false,

	haruna: async function (m, { sock, api, text }) {
		if (!text) return m.reply("Silakan berikan perintah yang benar: search, detail, atau lastupdate.");

		const [action, ...query] = text.split(" ");
		const queryText = query.join(" ");

		try {
			if (action === "search") {
				const res = await api.get("/shinigami/search", { q: queryText });

				if (res.status === "Success" && res.result.length > 0) {
					let replyText = `Hasil pencarian untuk "${queryText}":\n\n`;
					for (let item of res.result) {
						replyText += `📚 *${item.title}*\n`;
						replyText += `URL: ${item.url}\n`;
						replyText += `Rating: ${item.rating}\n`;
						replyText += `Chapter terbaru: ${item.latest_chapter} (${item.latest_chapter_url})\n\n`;
					}
					m.reply(replyText);
				} else {
					await m.react("❌");
					m.reply("Tidak dapat menemukan hasil pencarian.");
				}
			} else if (action === "detail") {
				const res = await api.get("/shinigami/detail", { url: queryText });

				if (res.status === "Success" && res.result) {
					let detail = res.result.detail_list;
					let chapters = res.result.chapter_list.map(chapter => 
						`📖 *${chapter.title}* - [Baca](${chapter.url}) (${chapter.release_date})\n`
					).join("");

					let replyText = `📚 *Detail Komik*\n`;
					replyText += `Rating: ${detail.rating_num}\n`;
					replyText += `Rank: ${detail.rank}\n`;
					replyText += `Alternative: ${detail.alternative}\n`;
					replyText += `Author: ${detail.author}\n`;
					replyText += `Artist: ${detail.artist}\n`;
					replyText += `Genre: ${detail.genre}\n`;
					replyText += `Type: ${detail.type}\n`;
					replyText += `Tag: ${detail.tag}\n\n`;
					replyText += `📖 *Chapters*\n${chapters}`;
					m.reply(replyText);
				} else {
					await m.react("❌");
					m.reply("Tidak dapat menemukan detail untuk URL tersebut.");
				}
			} else if (action === "lastupdate") {
				const res = await api.get("/shinigami/lastupdate");

				if (res.status === "Success" && res.result.length > 0) {
					let replyText = `📚 *Update Terbaru*\n\n`;
					for (let item of res.result) {
						replyText += `📚 *${item.title}*\n`;
						replyText += `URL: ${item.url}\n`;
						replyText += `Chapter terbaru: ${item.latest_chapter} (${item.latest_chapter_url})\n\n`;
					}
					m.reply(replyText);
				} else {
					await m.react("❌");
					m.reply("Tidak ada update terbaru.");
				}
			} else {
				m.reply("Perintah tidak valid. Gunakan 'shinigami search [judul]', 'shinigami detail [URL]', atau 'shinigami lastupdate'.");
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
