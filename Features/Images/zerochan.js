export default {
    command: ["zerochan"],
    description: "Search Random Images",
    category: "Images",
    owner: false,
    admin: false,
    hidden: false,
    limit: false,
    group: false,
    private: false,

    haruna: async function (m, { sock, api, text }) {
        if (!text) return m.reply("Silakan berikan link gambar dari Zerochan.");

        m.react('🕐');

        try {
            const res = await api.get("/zerochan", { q: text });

            if (res.status === "Success" && res.result.itemList.length > 0) {
                const randomIndex = Math.floor(Math.random() * res.result.itemList.length);
                const { url, thumbnailUrl } = res.result.itemList[randomIndex];

                await m.react('☑️');
                await sock.sendMessage(
                    m.chat,
                    { image: { url: url }, caption: `*${res.powered}*` },
                    { quoted: m }
                );
            } else {
                await m.react('❌');
                m.reply("Tidak dapat menemukan gambar yang sesuai dengan kriteria Anda.");
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
