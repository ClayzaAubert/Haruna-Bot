import Uploader from "../../Libs/Uploader.js";

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

    haruna: async function (m, { sock, api, text }) {
        try {
            if (m.quoted && /image/g.test(m.quoted.mtype || "")) {
                const media = await m.quoted.download();
                const buffer = Buffer.isBuffer(media) ? media : Buffer.from(media, "utf-8");
                const url = await Uploader.providers.telegraph.upload(buffer);

                m.replyUpdate("Processing image...", async (update) => {
                    const res = await api.get("/api/gemini/image", { q: text, url });
                    const message = res.result;
                    update(message);
                });

            } else {
                if (!text) {
                    return m.reply("Please provide a text query.");
                }

                m.replyUpdate("Processing text...", async (update) => {
                    const res = await api.get("/api/gemini/chat", { q: text });
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
