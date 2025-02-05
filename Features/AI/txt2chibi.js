import { Config } from "../../config.js";

export default {
    command: ["text2chibi", "txt2chibi"],
    description: "Create Chibi Image from Text",
    category: "AI",
    owner: false,
    admin: false,
    hidden: false,
    limit: false,
    group: false,
    private: false,

    haruna: async function (m, { sock, api, text }) {
        try {
            if (!text) {
                return m.reply("Masukkan prompt.");
            }

            const loadingMessage = await m.reply("Processing image...");

            const endpoint = "/txt2chibi";
            const res = await api.get(endpoint, { prompt: text, resolution: "Square" });

            if (res.status === "Success" && res.result.length > 0) {
                for (let imageUrl of res.result) {
                    await sock.sendMessage(m.chat, { image: { url: imageUrl } }, { quoted: loadingMessage });
                }
                await sock.sendMessage(m.chat, { text: `Prompt : ${text}\n\n*_${res.powered}_*` }, { quoted: loadingMessage });
            } else {
                await m.reply("Tidak dapat menemukan gambar untuk prompt tersebut.");
            }

        } catch (e) {
            console.error(e);
            m.reply("Terjadi kesalahan saat memproses permintaan.");
        }
    },

    failed: "Failed to execute the %cmd command\n\n%error",
    wait: null,
    done: null,
};
