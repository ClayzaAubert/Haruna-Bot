import { Config } from "../../config.js";

export default {
    command: ["bing"],
    description: "Chat & Create Image BING AI",
    category: "AI",
    owner: false,
    admin: false,
    hidden: false,
    limit: false,
    group: false,
    private: false,

    haruna: async function (m, { sock, api, text }) {
        try {
            if (!text || !text.includes("|")) {
                return m.reply("Format penggunaan salah. Gunakan 'bing chat|TEXT' atau 'bing image|PROMPT'.");
            }

            const [command, argument] = text.split("|").map(item => item.trim());

            if (command.toLowerCase() === "chat") {
                m.replyUpdate("Processing chat...", async (update) => {
                    const res = await api.get("/api/bing/chat", { cookie: Config.bing_cookie, q: argument });
                    const message = res.result;
                    update(message);
                });
            } else if (command.toLowerCase() === "image") {
                const loadingMessage = await m.reply("Processing image...");
                
                const endpoint = "/api/bing/createimage";
                const res = await api.get(endpoint, { cookie: Config.bing_cookie, prompt: argument });

                if (res.status === "Success" && res.result.length > 0) {
                    for (let imageUrl of res.result) {
                        await sock.sendMessage(m.chat, { image: { url: imageUrl } }, { quoted: loadingMessage });
                    }
                    await sock.sendMessage(m.chat, { text: `Prompt : ${prompt}\n\n*_${res.powered}_*` }, { quoted: loadingMessage });
                } else {
                    await m.reply("Tidak dapat menemukan gambar untuk prompt tersebut.");
                }
            } else {
                m.reply("Perintah tidak dikenali. Gunakan 'bing chat|TEXT' atau 'bing image|PROMPT'.");
            }

        } catch (e) {
            console.error(e);
            m.reply("Terjadi kesalahan saat memproses permintaan.");
        }
    },

    failed: "Failed to haruna the %cmd command\n\n%error",
    wait: null,
    done: null,
};
