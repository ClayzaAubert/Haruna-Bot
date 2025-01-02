export default {
	command: ["tiktok", "tt"],
	description: "Tiktok Downloader (Slide, Audio, Video)",
	category: "Download",
	owner: false,
	admin: false,
	hidden: false,
	limit: false,
	group: false,
	private: false,

	haruna: async function (m, { sock, api, text }) {
		if (!text) return m.reply("Silakan berikan tautan TikTok.");
		m.react("💬")

		try {
			const res = await api.get("/tiktok/download", { url: text });
			if (!res || !res.result) throw new Error("Tidak dapat mengambil data dari API.");

			const { title, source, duration, medias } = res.result;

			const images = medias.filter(media => media.extension.toLowerCase() === 'jpg');
			const mp3 = medias.find(media => media.extension.toLowerCase() === 'mp3');
			const sdVideo = medias.find(media => media.quality.toLowerCase() === 'sd');

			// Mengirim gambar jika ada
			if (images.length > 0) {
				for (const image of images) {
					await m.react("✅")
					await sock.sendMessage(
						m.chat,
						{ image: { url: image.url }, caption: `*_${res.powered}_*` },
						{ quoted: m }
					);
				}
				if (mp3) {
					await sock.sendMessage(
						m.chat,
						{
							audio: { url: mp3.url },
							mimetype: "audio/mp4",
						},
						{ quoted: m }
					);
				}
				return;
			}

			if (!sdVideo) throw new Error("Video dengan kualitas 'sd' tidak ditemukan.");

			const responseMessage = `🔍 Title: ${title}\n🃏 Source: ${source}\n⏳ Durasi: ${duration}\n📆 Size: ${sdVideo.formattedSize}\n💽 Quality: ${sdVideo.quality}\n`;

			await m.react("✅")
			await sock.sendMessage(
				m.chat,
				{ video: { url: sdVideo.url }, caption: responseMessage },
				{ quoted: m }
			);

			if (mp3) {
				await sock.sendMessage(
					m.chat,
					{
						audio: { url: mp3.url },
						mimetype: "audio/mp4",
					},
					{ quoted: m }
				);
			}
		} catch (error) {
			console.error("Error:", error);
			await m.react("❌");
			m.reply("Terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi nanti.");
		}
	},

	failed: "Failed to execute the %cmd command\n\n%error",
	wait: null,
	done: null,
};
