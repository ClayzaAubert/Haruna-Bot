export default {
	command: ["instagram", "ig"],
	description: "Instagram Donloader Image & Video",
	category: "Download",
	owner: false,
	admin: false,
	hidden: false,
	limit: false,
	group: false,
	private: false,

	haruna: async function (m, { sock, api, text }) {
		if (!text) return m.reply("Silakan berikan tautan Instagram.");
		m.react("💬");
		try {
			const res = await api.get("/instagram", { url: text });

			if (res.status === "Success" && res.result.length > 0) {
				for (let media of res.result) {
					await m.react("✅");
					if (media.download_link.includes("dl.igcdn.xyz")) {
						// Kirim sebagai gambar
						sock.sendMessage(
							m.chat,
							{ image: { url: media.download_link }, caption: `*_${res.powered}_*` },
							{ quoted: m }
						);
					} else {
						// Kirim sebagai video
						sock.sendMessage(
							m.chat,
							{ video: { url: media.download_link }, caption: `*_${res.powered}_*` },
							{ quoted: m }
						);
					}
				}
			} else {
				await m.react("❌");
				m.reply("Tidak dapat menemukan media tersebut.");
			}
		} catch (e) {
			console.error(e);
			await m.react("❌");
			m.reply("Terjadi kesalahan saat memproses permintaan.");
		}
	},

	failed: "Failed to haruna the %cmd command\n\n%error",
	wait: null,
	done: null,
};
