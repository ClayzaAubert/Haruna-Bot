export default {
    command: ["seaart"],
    description: "Text To Image Seaart LORA",
    category: "AI",
    owner: false,
    admin: false,
    hidden: false,
    limit: false,
    group: false,
    private: false,

    haruna: async function (m, { sock, api, text }) {
        try {
            if (!text) return m.reply("Masukan Promptnya");

            m.reply("Processing...");

            const endpoint = "/api/seaart";
            const res = await api.get(endpoint, { prompt: text });

            if (!res || res.status !== "Success" || !res.result || !Array.isArray(res.result) || res.result.length === 0) {
                throw new Error("Failed to retrieve anime image. Please try again later.");
            }

            for (let image of res.result) {
                const caption = `*[ TEXT TO IMAGE SEAART ]*\n\n*Width:* ${image.width}\n*Height:* ${image.height}\n*NSFW Plus:* ${image.is_nsfw_plus}\n\n*_${res.powered}_*`;
                await sock.sendMessage(
                    m.chat,
                    { image: { url: image.url }, caption: caption },
                    { quoted: m }
                );
            }
        } catch (e) {
            console.error(e);
            m.reply("Terjadi kesalahan saat memproses permintaan. Mungkin file terlalu besar atau silakan coba lagi nanti.");
        }
    },

    failed: "Failed to haruna the %cmd command\n\n%error",
    wait: null,
    done: null,
};
