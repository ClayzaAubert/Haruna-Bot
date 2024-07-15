export default {
    command: ["juicy"],
    description: "Chat, Search, Create Room Juicy AI",
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
                return m.reply("Silakan masukkan perintah yang benar. Contoh penggunaan:\n\njuicy search <TEXT>\njuicy createroom <CHAR_ID>\njuicy chat <TEXT>");
            }

            // Search command
            if (text.startsWith("search")) {
                const searchTerm = text.slice(7).trim();
                m.replyUpdate("Searching...", async (update) => {
                    const res = await api.get("/api/juicy/search", { q: searchTerm });
                    if (!res || res.status !== "Success" || !res.result || res.result.length === 0) {
                        update("Tidak ada hasil yang ditemukan.");
                    } else {
                        const message = res.result.map(item => `*Char ID :* ${item.character_id}\n*Char Name :* ${item.name}\n*Rating :* ${item.rating}\n*Greating :* ${item.greeting}\n*Avatar :* ${item.avatar}\n_______________________________`).join('\n')
                        update(message);
                    }
                });
            }

            // Create Room command
            else if (text.startsWith("createroom")) {
                const charId = text.slice(11).trim();
                m.replyUpdate("Creating room...", async (update) => {
                    const res = await api.get("/api/juicy/createroom", { charid: charId });
                    if (!res || res.status !== "Success" || !res.result) {
                        update("Gagal membuat ruangan. Pastikan ID karakter benar.");
                    } else {
                        const message = `*Character ID:* ${res.result.data.greeting.character_id}\n*Chat ID:* ${res.result.data.chat_key}\n*Content :* ${res.result.data.greeting.content}`;
                        update(message);
                    }
                });
            }

            // Chat command
            else if (text.startsWith("chat")) {
                m.replyUpdate("Chatting...", async (update) => {
                    const res = await api.get("/api/juicy/chat", { q: text, chatid: "b1901d98-40ef-11ef-88db-0242ac110002" });
                    if (!res || res.status !== "Success" || !res.result ) {
                        update("Tidak ada balasan yang ditemukan.");
                    } else {
                        const candidate = res.result;
                        update(candidate);
                    }
                });
            }

            // Invalid command
            else {
                m.reply("Perintah tidak valid. Gunakan 'juicy search', 'juicy createroom', atau 'juicy chat'.");
            }
        } catch (error) {
            console.error(error);
            m.reply("Terjadi kesalahan saat memproses permintaan.");
        }
    },

    failed: "Gagal menjalankan perintah %cmd\n\n%error",
    wait: null,
    done: null,
};
