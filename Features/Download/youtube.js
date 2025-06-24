export default {
	command: ["yt", "youtube"],
	description: "YouTube Downloader (Play, Audio, Video)",
	category: "Download",
	owner: false,
	admin: false,
	hidden: false,
	limit: false,
	group: false,
	private: false,

	haruna: async function (m, { sock, api, text }) {
		if (!text) return m.reply(
			`Contoh penggunaan:\n` +
			`- yt play despacito\n` +
			`- yt audio <url>\n` +
			`- yt video <url>`
		);

		const [mode, ...rest] = text.trim().split(" ");
		const query = rest.join(" ");

		const isPlay = mode === "play";
		const isAudio = mode === "audio";
		const isVideo = mode === "video";

		if (!isPlay && !isAudio && !isVideo)
			return m.reply("Gunakan subcommand `play`, `audio`, atau `video`.\nContoh: `yt play alan walker`");

		if (!query) return m.reply(`Silakan masukkan ${isPlay ? "query pencarian" : "URL YouTube"}!`);

		m.react("🔄");

		const endpoint = isPlay
			? "/youtube/play"
			: isAudio
			? "/youtube/audio"
			: "/youtube/video";

		try {
			const res = await api.get(endpoint, isPlay ? { q: query } : { url: query });
			const data = res?.result;
			if (!data) throw new Error("Respons dari API kosong.");

			const {
				title,
				channel,
				channelId,
				publishedAt,
				duration,
				definition,
				thumbnails,
				statistics,
				description,
				size,
				url,
			} = data;

			const thumbUrl = thumbnails?.default?.url;

			const caption = `🎵 *${title}*\n\n` +
				`👤 Channel: ${channel}\n🆔 ID: ${channelId}\n📅 Dirilis: ${publishedAt}\n⏱️ Durasi: ${duration}\n` +
				(isVideo ? `📺 Resolusi: ${definition?.toUpperCase() || "-"}\n` : "") +
				`📁 Ukuran: ${size || "-"}\n\n` +
				`📊 Statistik:\n  • Views: ${statistics.viewCount}\n  • Likes: ${statistics.likeCount}\n  • Komentar: ${statistics.commentCount}\n\n` +
				`📝 Deskripsi:\n${description?.substring(0, 300) || "-"}\n\n_${res.powered}_`;

			if (thumbUrl) {
				await sock.sendMessage(
					m.chat,
					{ image: { url: thumbUrl }, caption },
					{ quoted: m }
				);
			} else {
				await m.reply(caption);
			}

			await m.react("✅");

			if (isVideo) {
				await sock.sendMessage(
					m.chat,
					{ video: { url }, caption: `🎬 ${title}` },
					{ quoted: m }
				);
			} else {
				await sock.sendMessage(
					m.chat,
					{
						audio: { url },
						mimetype: "audio/mp4",
						fileName: `${title}.mp3`,
					},
					{ quoted: m }
				);
			}
		} catch (error) {
			console.error("YouTube Error:", error);
			await m.react("❌");
			m.reply("Gagal mengambil data dari YouTube. Pastikan query/URL valid.");
		}
	},

	failed: "Gagal menjalankan %cmd\n\n%error",
	wait: null,
	done: null,
};
