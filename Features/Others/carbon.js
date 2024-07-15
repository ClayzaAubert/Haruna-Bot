export default {
    command: ["carbon"],
    description: "Convert Code To Images",
    category: "Others",
    owner: false,
    admin: false,
    hidden: false,
    limit: false,
    group: false,
    private: false,

    haruna: async function (m, { sock, api, text }) {
        if (!text) return m.reply("Linknya Mana?");
        m.react('🕐')

        try {
            const res = await api.get("/api/carbon", { q: text });

            await m.react('☑️')
            await sock.sendMessage(
                m.chat,
                { image: { url: res.result.name }, caption: `*_${res.powered}_*` },
                { quoted: m }
            );
        } catch (error) {
            console.error("Error:", error);
            await m.react('❌')
            m.reply("Terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi nanti.");
        }
    },

    failed: "Failed to haruna the %cmd command\n\n%error",
    wait: null,
    done: null,
};
