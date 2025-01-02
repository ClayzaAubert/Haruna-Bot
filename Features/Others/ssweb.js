export default {
    command: ["ssweb"],
    description: "SS Website",
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
            const res = await api.get("/ssweb", { url: text, widht: 1920, height: 1080 });

            await m.react('☑️')
            await sock.sendMessage(
                m.chat,
                { image: { url: res.result.url }, caption: `*_${res.powered}_*` },
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
