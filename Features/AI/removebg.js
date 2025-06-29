export default {
	command: ["removebg", "rmbg"],
	description: "Remove Background",
	category: "AI",
	owner: false,
	admin: false,
	hidden: false,
	limit: false,
	group: false,
	private: false,

    haruna: async function (m, { sock, api, cdn }) {
        const q = m.quoted || m;
        const mime = q.message?.mimetype || "";
        const isImage = /webp|image/.test(mime) || ["imageMessage", "stickerMessage"].includes(q.mtype);

        if (!isImage) {
            return m.reply("Please reply/send an image with the command");
        }

        try {
            const media = await q.download();
            const url = await cdn.maelyn(media);

            const response = await api.get("/img2img/removebg", { url: url });

            if (response.status === "Success") {
                await sock.sendMessage(
                    m.chat,
                    { image: { url: response.result.url }, caption: `*_${response.powered}_*` },
                    { quoted: m }
                );
            } else {
                throw new Error(`Failed to fetch removebg result. Status: ${response.status}`);
            }
        } catch (error) {
            console.error("Error fetching removebg result:", error);
            await m.reply("Failed to fetch removebg result. Please try again later.");
        }
    },
    failed: "Failed to execute the %cmd command\n%error",
    wait: ["Please wait %tag", "Hold on %tag, fetching response"],
    done: null,
};