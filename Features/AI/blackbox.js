export default {
    command: ["blackbox"],
    description: "Chat, Chat + Reply Image, or Generate Image using Blackbox AI",
    category: "AI",
    owner: false,
    admin: false,
    hidden: false,
    limit: false,
    group: false,
    private: false,

    haruna: async function (m, { sock, api, text }) {
        try {
            if (text && text.startsWith("/imagine")) {
                const query = text.replace("/imagine", "").trim();

                if (!query) {
                    return m.reply("Please provide a description for the image using `/imagine <description>`.");
                }

                m.reply("Generating image...");
                const res = await api.get("/blackbox/imagine", { prompt: query });
                await sock.sendMessage(
                    m.chat,
                    { image: { url: res.result.url }, caption: `*_${res.powered}_*` },
                    { quoted: m }
                );

            } else if (m.quoted && /image/g.test(m.quoted.mtype || "")) {
                const media = await m.quoted.download();
                const buffer = Buffer.isBuffer(media) ? media : Buffer.from(media, "utf-8");
                const url = await Uploader.providers.quax.upload(buffer);

                m.reply("Processing image...");
                const res = await api.get("/blackbox/image", { url, q: text });
                await sock.sendMessage(
                    m.chat,
                    { image: { url: res.result.url }, caption: `*_${res.powered}_*` },
                    { quoted: m }
                );

            } else {
                if (!text) {
                    return m.reply(
                        "Please provide a text query. Usage:\n" +
                        "- `/imagine <description>`: Generate an image based on a description.\n" +
                        "- Reply to an image with a query: Analyze the image.\n" +
                        "- `<text>`: Chat with the AI."
                    );
                }

                m.reply("Processing text...");
                const res = await api.get("/blackbox/chat", { q: text });
                await sock.sendMessage(
                    m.chat,
                    { text: res.result },
                    { quoted: m }
                );
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
