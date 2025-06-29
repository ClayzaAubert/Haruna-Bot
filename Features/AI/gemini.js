export default {
    command: ["gemini"],
    description: "Chat Dengan Gemini AI",
    category: "AI",
    owner: false,
    admin: false,
    hidden: false,
    limit: false,
    group: false,
    private: false,

    haruna: async function (m, { sock, api, text, cdn }) {
        try {
            if (m.quoted && /webp|image/.test(m.quoted.message?.mimetype || "")) {
                const media = await m.quoted.download();
                const url = await cdn.maelyn(media);

                m.replyUpdate("Processing image...", async (update) => {
                    const res = await api.get("/gemini/image", { q: text, url });
                    const message = res.result;
                    update(message);
                });

            } else {
                if (!text) {
                    return m.reply("Please provide a text query.");
                }

                m.replyUpdate("Processing text...", async (update) => {
                    const res = await api.get("/gemini/chat", { q: text });
                    const message= res.result;
                    update(message);
                });
            }
        } catch (error) {
            console.error(error);
            m.reply("Failed to process the command. Please try again later.");
        }
    },

    failed: "Failed to haruna the %cmd command\n\n%error",
    wait: null,
    done: null,
};
