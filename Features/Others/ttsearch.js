export default {
    command: ["tiktoksearch", "ttsearch"],
    description: "Tiktok Search",
    category: "Others",
    owner: false,
    admin: false,
    hidden: false,
    limit: false,
    group: false,
    private: false,

    haruna: async function (m, { sock, api, text }) {
        if (!text) return m.reply("Silakan berikan kata kunci untuk pencarian TikTok.");

        m.react('🕐');

        try {
            const res = await api.get("/api/tiktok/search", { q: text });

            if (res.status === "Success" && res.result) {
                const { no_watermark, watermark } = res.result;

                await m.react('☑️');
                await sock.sendMessage(
                    m.chat,
                    { video: { url: no_watermark }, caption: `*${res.powered}*` },
                    { quoted: m }
                );
            } else {
                await m.react('❌');
                m.reply("Tidak dapat menemukan video TikTok yang sesuai dengan kriteria Anda.");
            }
        } catch (error) {
            console.error("Error:", error);
            await m.react('❌');
            m.reply("Terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi nanti.");
        }
    },

    failed: "Gagal menjalankan perintah %cmd\n\n%error",
    wait: null,
    done: null,
};
