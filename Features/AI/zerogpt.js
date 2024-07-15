export default {
    command: ["zerogpt"],
    description: "ZeroGPT",
    category: "AI",
    owner: false,
    admin: false,
    hidden: false,
    limit: false,
    group: false,
    private: false,

    haruna: async function (m, { sock, api, text }) {
        if (!text) {
            return m.reply("Masukan Text yang ingin di cek apakah buatan AI");
        }
        m.replyUpdate("...", async (update) => {
            const res = await api.get("/api/zerogpt", {
                q: text,
            });
            const clayza = res.result;
            const clayzaRes = `*Hasil ZeroGPT:*\n\nIs Human: ${clayza.isHuman}%\nText Words: ${clayza.textWords}\nAI Words: ${clayza.aiWords}\nFeedback: ${clayza.feedback}\n\nOriginal Paragraph:\n${clayza.originalParagraph}`;
            update(clayzaRes);
        });
    },

    failed: "Failed to haruna the %cmd command\n\n%error",
    wait: null,
    done: null,
};
