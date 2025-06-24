export default {
	command: ["tiktok", "tt"],
	description: "Tiktok/Douyin Downloader (Slide, Audio, Video)",
	category: "Download",
	owner: false,
	admin: false,
	hidden: false,
	limit: false,
	group: false,
	private: false,

	haruna: async function (m, { sock, api, text }) {
		if (!text) return m.reply("Silakan berikan tautan TikTok.");
		m.react("💬");

		try {
			const res = await api.get("/tiktok/download", { url: text });
			const data = res?.result;
			if (!data) throw new Error("Tidak dapat mengambil data dari API.");

			const { title, author, video, image_data, music } = data;

			// Jika image_data (photo mode)
			if (image_data?.no_watermark_image_list?.length) {
				await m.react("🖼️");

				const albumItems = image_data.no_watermark_image_list.map((imgUrl, i) => ({
					image: { url: imgUrl },
					caption: i === 0 ? `🖼️ *${title}*\n👤 @${author.username}\n\n_${res.powered}_` : undefined
				}));

				await sock.sendAlbumMessage(
					m.chat,
					albumItems,
					{
						quoted: m,
						delay: 1.5 // delay antar file (detik), opsional
					}
				);

				if (music?.url) {
					await sock.sendMessage(
						m.chat,
						{
							audio: { url: music.url },
							mimetype: "audio/mp4",
							fileName: music.title || "audio.mp3",
						},
						{ quoted: m }
					);
				}

				return;
			}

			// Jika video
			if (video?.nwm_url || video?.nwm_url_hq) {
				await m.react("📽️");

				const videoUrl = video.nwm_url_hq || video.nwm_url;
				const caption = `🎬 *${title}*\n👤 @${author.username}\n✅ Verified: ${author.verified ? "Ya" : "Tidak"}\n🌍 Region: ${data.region}\n\n🎵 Musik: ${music?.title || "Unknown"}\n\n_${res.powered}_`;

				await sock.sendMessage(
					m.chat,
					{ video: { url: videoUrl }, caption },
					{ quoted: m }
				);

				if (music?.url) {
					await sock.sendMessage(
						m.chat,
						{
							audio: { url: music.url },
							mimetype: "audio/mp4",
							fileName: music.title || "audio.mp3",
						},
						{ quoted: m }
					);
				}

				return;
			}

			throw new Error("Tidak ada konten yang dapat dikirim (gambar atau video tidak ditemukan).");
		} catch (error) {
			console.error("Error:", error);
			await m.react("❌");
			m.reply("Terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi nanti.");
		}
	},

	failed: "Gagal menjalankan perintah %cmd\n\n%error",
	wait: null,
	done: null,
};
