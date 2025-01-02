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
				const res = await api.get("/spotify/search", { q: queryText });
				
				if (res.status === "Success" && res.result.tracks.length > 0) {
					let replyText = `Hasil pencarian untuk "${res.result.Search}":\n\n`;
					for (let track of res.result.tracks) {
						replyText += `🎵 *${track.title}* oleh *${track.artists}*\n`;
						replyText += `Rilis: ${track.release}\n`;
						replyText += `Spotify: ${track.link_spotify}\n`;
						replyText += `Album Name: ${track.album_name}\n\n`;
						replyText += `Album Realse Date: ${track.album_release_date}\n\n`;
					}
					await m.react("✅");
					m.reply(replyText);
				} else {
					await m.react("❌");
					m.reply("Tidak dapat menemukan lagu tersebut.");
				}
			} else if (action === "download") {
				const res = await api.get("/spotify/download", { url: queryText });

				if (res.status === "Success" && res.result.url) {
					await m.react("✅");
					await sock.sendMessage(
						m.chat,
						{ image: { url: res.result.album.images[0].url },  caption: `*Artist(s):* _${res.result.artists.join(", ")}_\n*Title:* _${res.result.title}_\n*Album:* _${res.result.album.name}_\n*Release Date:* _${res.result.album.release_date}_\n*Album Type:* _${res.result.album.album_type}_\n*Popularity:* _${res.result.popularity}_\n*Duration (ms):* _${res.result.duration_ms}_\n*Explicit:* _${res.result.explicit ? "Yes" : "No"}_\n*Size:* _${res.result.size || "Unknown"}_\n*Preview:* _${res.result.preview_url || "No preview available"}_\n\n*_${res.powered}_*` },
						{ quoted: m }
					);
					sock.sendMessage(
						m.chat,
						{
							audio: {
								url: res.result.url,
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
