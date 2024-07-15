export default {
	command: ["facebook", "fb"],
	description: "Facebook Downloader",
	category: "Download",
	owner: false,
	admin: false,
	hidden: false,
	limit: false,
	group: false,
	private: false,

	haruna: async function (m, { sock, api, text }) {
		if (!text) return m.reply("Silakan berikan tautan Facebook.");
		m.react("💬")
        try {
			const res = await api.get("/api/facebook", { url: text });
			const clayza = res.result;
		
			const sdVideo = clayza.video_hd || clayza.video_sd;
			const mp3 = clayza.audio;
			if (!sdVideo) throw "Video tidak ditemukan.";
		
			await m.react("✅")
			await sock.sendMessage(
				m.chat,
				{ video: { url: sdVideo }, caption: `_*${res.powered}*_` },
				{ quoted: m }
			);

			if (mp3) {
				await sock.sendMessage(
					m.chat,
					{
						audio: { url: mp3 },
						mimetype: "audio/mp4",
					},
					{ quoted: m }
				);
			}
		  } catch (error) {
			console.error("Error:", error);
			await m.react("❌");
		  }
	},

	failed: "Failed to haruna the %cmd command\n\n%error",
	wait: null,
	done: null,
};
