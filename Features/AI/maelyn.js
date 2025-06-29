import Uploader from "../../Libs/Uploader.js";

export default {
	command: ["maelyn"],
	description: "Chat with Maelyn AI",
	category: "AI",
	owner: false,
	admin: false,
	hidden: false,
	limit: false,
	group: false,
	private: false,

	haruna: async function (m, { sock, api, cdn }) {
		try {
			await m.react("🕒");

			let imageUrl = "";
			const q = m.quoted ? m.quoted : m;
			const mime = q.message?.mimetype || "";
			const text = m.text || "gambar apa ini";
            const isImage = /webp|image/.test(mime) || ["imageMessage", "stickerMessage"].includes(q.mtype);

			// Memproses gambar jika ada
			if (isImage) {
				const img = await q.download();
				if (!img) throw new Error("Gagal mengunduh gambar.");

				imageUrl = await cdn.maelyn(img);
				if (!imageUrl) throw new Error("Gagal mengunggah gambar.");
			}

			// Mengirim permintaan ke API
			const response = await api.get("/maelynai/chat", {
				q: text,
				url: imageUrl,
				roleplay: "kamu adalah maelyn ai",
				uuid: "maelynai-edfae4ae-2f78-4ee0-8e3a-dd56670afbd6",
			});

			// Memastikan respon dari API valid
			if (!response || !response.status) throw new Error("Gagal menghubungi API.");
			const data = response;
			console.log(data)
			if (!data || data.status !== "Success" || data.code !== 200) {
				throw new Error(data.result || "API mengembalikan status tidak sukses.");
			}

			// Memastikan hasil ada sebelum memproses
			const result = data.result;
			if (!result) throw new Error("Hasil dari API tidak ditemukan.");

			// Membuat caption untuk pesan balasan
			const caption = [
				`_${data.powered}_`,
				"",
				result.content || "",
				"",
				"Sumber:",
				...(Object.entries(result.sources || {}).map(
					([key, value]) => `${key}: ${value}`
				)),
			].join("\n");

			// Mengirim pesan balasan dengan gambar atau teks
			if (result.imageUrl) {
				await sock.sendMessage(
					m.chat,
					{
						image: { url: result.imageUrl },
						caption: caption,
					},
					{ quoted: m }
				);
			} else {
				await sock.sendMessage(
					m.chat,
					{
						text: caption,
					},
					{ quoted: m }
				);
			}

			await m.react("✅");
		} catch (error) {
			// Menangani kesalahan dan memberikan respons yang informatif
			console.error("Maelyn API Error:", error);
			const errorMessage =
				error?.message || error?.toString() || "Terjadi kesalahan yang tidak diketahui.";
			await m.reply(`Error: ${errorMessage}`);
			await m.react("❌");
		}
	},

	failed: "Gagal menjalankan perintah %cmd\n%error",
	wait: ["Harap tunggu %tag", "Sebentar %tag, sedang memproses"],
	done: null,
};
