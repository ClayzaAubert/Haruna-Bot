export default {
    command: ["meta"],
    description: "Imagine with Meta.",
    category: "AI",
    owner: false,
    admin: false,
    hidden: false,
    limit: true,
    group: false,
    private: false,

    haruna: async function (m, { sock, api, text }) {
        if (!text) {
            return m.reply("Masukkan promptnya.");
        }

        const loadingMessage = await m.reply("Sedang membuat gambar dan video...");

        try {
            const response = await api.get("/metaai/art", { 
                prompt: text // Menggunakan teks sebagai prompt
            });

            if (response.status === "Success") {
                const results = response.result;

                if (Array.isArray(results) && results.length > 0) {
                    for (const item of results) {
                        // Kirim gambar
                        const imageUrl = item.ImageUrl;
                        await sock.sendMessage(
                            m.chat, 
                            { image: { url: imageUrl } }, 
                            { quoted: loadingMessage }
                        );

                        // Kirim video
                        const videoUrl = item.VideoUrl;
                        await sock.sendMessage(
                            m.chat, 
                            { video: { url: videoUrl }, caption: "Video terkait gambar." }, 
                            { quoted: loadingMessage }
                        );
                    }
                    await m.reply("Gambar dan video selesai dibuat!");
                } else {
                    await m.reply("Tidak ada gambar atau video yang ditemukan dalam respons.");
                }
            } else {
                throw new Error(`Gagal mendapatkan hasil. Status: ${response.status}`);
            }
        } catch (error) {
            console.error("Error fetching API result:", error);
            await m.reply("Terjadi kesalahan saat mengambil hasil dari API. Silakan coba lagi nanti.");
        }
    },

    failed: "Gagal menjalankan perintah %cmd\n%error",
    wait: null,
    done: null,
};
