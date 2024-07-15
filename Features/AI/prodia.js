export default {
    command: ["prodia"],
    description: "Prodia Generate Image",
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
                return m.reply("List Model : .prodia model\nGenerate : .prodia generate 47|kurodate haruna");
            }

            // Check if the command is for generating image
            if (text.startsWith("generate")) {
                const [modelPrompt, promptText] = text.slice(9).split("|").map(item => item.trim());
                const modelIndex = modelPrompt.match(/\d+/)[0];
                m.reply("Processing...")

                // Fetch models from API
                const modelRes = await api.get("/api/prodia/model");
                if (!modelRes || !modelRes.result || modelRes.result.length === 0) {
                    throw new Error("Failed to retrieve models from Prodia API.");
                }

                const models = modelRes.result;
                const selectedModel = models[parseInt(modelIndex) - 1];

                const generateRes = await api.get("/api/prodia/generate", { prompt: promptText, model: selectedModel });
                if (!generateRes || generateRes.status !== "Success" || !generateRes.result || generateRes.result.length === 0) {
                    throw new Error("Failed to retrieve image from Prodia API.");
                }

                const clayza = generateRes.result[0];
                const size = clayza.size;

                await sock.sendMessage(
                    m.chat,
                    {
                        image: { url: clayza.name },
                        caption: `*[ TEXT TO IMAGE PRODIA ]*\n\n*Prompt:* ${promptText}\n*Model:* "${selectedModel}"\n*Size:* ${size}\n\n*_${generateRes.powered}_*`
                    },
                    { quoted: m }
                );
            }

            // Check if the command is for listing models
            else if (text.startsWith("model")) {
                m.replyUpdate("Fetching models...", async (update) => {
                    const modelRes = await api.get("/api/prodia/model");
                    if (!modelRes || !modelRes.result || modelRes.result.length === 0) {
                        update("Tidak ada model yang tersedia.");
                    } else {
                        const models = modelRes.result;
                        const modelList = `*Daftar Model Prodia:*\n\n${models.map((model, index) => `${index + 1}. ${model}`).join('\n')}`;
                        update(modelList);
                    }
                });
            }

            // Invalid command
            else {
                m.reply("Perintah tidak valid. Gunakan `prodia generate (MODEL)|(PROMPT)` atau `prodia model`.");
            }
        } catch (error) {
            console.error("Error:", error);
            m.reply("Terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi nanti.");
        }
    },

    failed: "Failed to execute the %cmd command\n\n%error",
    wait: null,
    done: null,
};