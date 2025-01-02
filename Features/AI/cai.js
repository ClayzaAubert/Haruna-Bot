export default {
    command: ["cai"],
    description: "Chat, Search, Create Room Character AI",
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
                return m.reply("Silakan masukkan perintah yang benar. Contoh penggunaan:\n\ncai search <TEXT>\ncai createroom <CHAR_ID>\ncai chat <TEXT>");
            }

            // Search command
            if (text.startsWith("search")) {
                const searchTerm = text.slice(7).trim();
                m.replyUpdate("Searching...", async (update) => {
                    const res = await api.get("/cai/search", { q: searchTerm });
                    if (!res || res.status !== "Success" || !res.result || res.result.length === 0) {
                        update("Tidak ada hasil yang ditemukan.");
                    } else {
                        const message = res.result.map(item => (
                            `*Char ID :* ${item.char_id}\n` +
                            `*Char Name :* ${item.char_name}\n` +
                            `*Title :* ${item.title}\n` +
                            `*Avatar :* ${item.avatar_file_name}\n` +
                            `*Greeting :* ${item.greeting}\n` +
                            `*Score :* ${item.search_score}\n` +
                            `_______________________________`
                        )).join('\n');
                        update(message);
                    }
                });
            }

            // Create Room command
            else if (text.startsWith("createroom")) {
                const charId = text.slice(11).trim();
                m.replyUpdate("Creating room...", async (update) => {
                    const res = await api.get("/cai/createroom", { charid: charId });
                    if (!res || res.status !== "Success" || !res.result) {
                        update("Gagal membuat ruangan. Pastikan ID karakter benar.");
                    } else {
                        const { chat: { chat_id, create_time, character_id } } = res.result;
                        const message = `*Character ID:* ${character_id}\n*Chat ID:* ${chat_id}\n*Create Time:* ${create_time}`;
                        update(message);
                    }
                });
            }

            // Chat command
            else if (text.startsWith("chat")) {
                m.replyUpdate("Chatting...", async (update) => {
                    const res = await api.get("/cai/chat", { q: text, charid: "cQaMyajxdi6r5_403nN_5x_MgC4hk1ud3gE5LocrBHw", chatid: "ff07f3f4-fc58-4b98-971c-898164476ca3" });
                    if (!res || res.status !== "Success" || !res.result || res.result.candidates.length === 0) {
                        update("Tidak ada balasan yang ditemukan.");
                    } else {
                        const candidate = res.result.candidates[0];
                        update(candidate.raw_content);
                    }
                });
            }

            // Invalid command
            else {
                m.reply("Perintah tidak valid. Gunakan 'cai search', 'cai createroom', atau 'cai chat'.");
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
