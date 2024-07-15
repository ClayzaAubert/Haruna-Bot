export default {
	command: ["twiter", "x"],
	description: "Twitter Downloader",
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
			const res = await api.get("/api/x", { url: text });
			const clayza = res.result;
			const ClayzaRes = `🔍 Desc: ${clayza.desc}\n🃏 Thumb: ${clayza.thumb}`;
		
			await m.react("✅")
			await sock.sendMessage(
				m.chat,
				{ video: { url: clayza.video_hd }, caption: ClayzaRes },
				{ quoted: m }
			);
		  } catch (error) {
			console.error("Error:", error);
			await m.react("❌");
			m.reply("Terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi nanti.");
		  }
	},

	failed: "Failed to haruna the %cmd command\n\n%error",
	wait: null,
	done: null,
};
