import Uploader from "../../Libs/Uploader.js";

export default {
    command: ["aifilter"], 
    description: "Photo To Photo", 
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
            return m.reply("Please reply/send an image with the command.");
        }

        const media = await q.download();
        const buffer = Buffer.isBuffer(media) ? media : Buffer.from(media, "utf-8");
        const url = await Uploader.providers.quax.upload(buffer);

        if (!text) {
            return m.reply("Please specify a model: `.aifilter toanime`, `.aifilter tomanga`, `.aifilter tocartoon`, `.aifilter tolego`, `.aifilter totoy`, `.aifilter topixelart`, `.aifilter tosketch`, `.aifilter tounderwater`.");
        }

        const model = text.toLowerCase().trim();

        let endpoint;
        switch (model) {
            case "toanime":
                endpoint = "/toanime";
                break;
            case "tomanga":
                endpoint = "/tomanga";
                break;
            case "tocartoon":
                endpoint = "/tocartoon";
                break;
            case "tolego":
                endpoint = "/tolego";
                break;
            case "totoy":
                endpoint = "/totoy";
                break;
            case "topixelart":
                endpoint = "/topixelart";
                break;
            case "tosketch":
                endpoint = "/tosketch";
                break;
            case "tounderwater":
                endpoint = "/tounderwater";
                break;
            default:
                return m.reply("Invalid model. Please use one of the following: `toanime`, `tomanga`, `tocartoon`, `tolego`, `totoy`, `topixelart`, `tosketch`, `tounderwater`.");
        }

        await m.reply("Processing your request... Please wait.");

        try {
            const response = await api.get(endpoint, { url: url });

            if (response.status === "Delay") {
                const delayTime = response.result.match(/\d+/);
                return m.reply(`You are being rate-limited. Please wait ${delayTime} seconds before making another request.`);
            }

            if (response.status === "Success") {
                const res = response;
                await sock.sendMessage(
                    m.chat,
                    { image: { url: res.result.url }, caption: `*_${res.powered}_*` },
                    { quoted: m }
                );
            } else {
                throw new Error(`Failed to fetch result from ${model}. Status: ${response.status}`);
            }
        } catch (error) {
            console.error("Error fetching result:", error);
            await m.reply("Failed to fetch the result. Please try again later.");
        }
    },
    failed: "Failed to execute the %cmd command\n%error",
    wait: ["Please wait %tag", "Hold on %tag, fetching response"],
    done: null,
};
