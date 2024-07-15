import Uploader from "../../Libs/Uploader.js";

export default {
    command: ["img2img"],
    description: "Image To Image + Prompt",
    category: "AI",
    owner: false,
    admin: false,
    hidden: false,
    limit: false,
    group: false,
    private: false,

    haruna: async function (m, { sock, api, text }) {
        const q = m.quoted ? m.quoted : m;
        const mime = q.mtype || "";

        if (!mime.startsWith("image/")) {
            return m.reply("Please reply/send an image with the command");
        }

        if (!text) {
            return m.reply("Please provide a prompt for the image transformation.");
        }

        const media = await q.download();
        const buffer = Buffer.isBuffer(media) ? media : Buffer.from(media, "utf-8");
        const url = await Uploader.providers.telegraph.upload(buffer);

        try {
            m.reply("Processing image with the provided prompt...");

            const response = await api.get("/api/img2img", { url: url, prompt: text });

            if (response.status === "Success") {
                const res = response;
                await sock.sendMessage(
                    m.chat,
                    { image: { url: res.result.name }, caption: `Prompt: ${text}\n*_${res.powered}_*` },
                    { quoted: m }
                );
            } else {
                throw new Error(`Failed to fetch Remini result. Status: ${response.status}`);
            }
        } catch (error) {
            console.error("Error fetching Remini result:", error);
            await m.reply("Failed to fetch Remini result. Please try again later.");
        }
    },
    failed: "Failed to execute the %cmd command\n%error",
    wait: ["Please wait %tag", "Hold on %tag, fetching response"],
    done: null,
};
