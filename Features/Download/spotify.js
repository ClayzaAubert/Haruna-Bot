export default {
	command: ["spotify"],
	description: "Spotify Search & Download",
	category: "Download",
	owner: false,
	admin: false,
	hidden: false,
	limit: false,
	group: false,
	private: false,

	haruna: async function (m, { sock, api, text, command }) {
		if (!text) return m.reply("Silakan berikan tautan Spotify atau judul lagu yang ingin dicari.");
		m.react("💬");

		const [action, ...query] = text.split(" ");
		const queryText = query.join(" ");

		try {
			if (action === "search") {
				const res = await api.get("/api/spotify/search", { q: queryText });
				
				if (res.status === "Success" && res.result.tracks.length > 0) {
					let replyText = `Hasil pencarian untuk "${res.result.Search}":\n\n`;
					for (let track of res.result.tracks) {
						replyText += `🎵 *${track.title}* oleh *${track.artists}*\n`;
						replyText += `Rilis: ${track.release}\n`;
						replyText += `Spotify: ${track.link_spotify}\n`;
						replyText += `Preview: ${track.link_preview}\n\n`;
					}
					await m.react("✅");
					m.reply(replyText);
				} else {
					await m.react("❌");
					m.reply("Tidak dapat menemukan lagu tersebut.");
				}
			} else if (action === "download") {
				const res = await api.get("/api/spotify/download", { url: queryText });

				if (res.status === "Success" && res.result.name) {
					await m.react("✅");
					await sock.sendMessage(
						m.chat,
						{ image: { url: res.result.Details.cover }, caption: `*Artis :* _${res.result.Details.artists}_\n*Title :* _${res.result.Details.title}_\n*Size :* _${res.result.size}_\n\n*_${res.powered}_*` },
						{ quoted: m }
					);
					sock.sendMessage(
						m.chat,
						{
							audio: {
								url: res.result.name,
							},
							mimetype: "audio/mp4",
						},
						{ quoted: m }
					);
				} else {
					await m.react("❌");
					m.reply("Tidak dapat menemukan media tersebut.");
				}
			} else {
				m.reply("Perintah tidak valid. Gunakan 'spotify search [judul lagu]' atau 'spotify download [link]'.");
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
