export default {
    command: ["gpt"],
    description: "Chat with GPT.",
    category: "AI",
    owner: false,
    admin: false,
    hidden: false,
    limit: true,
    group: false,
    private: false,

    haruna: async function (m, { sock, api, text }) {
        if (!text) {
            return m.reply(
                "> GPT Model :\n" +
                "- gpt-4\n" +
                "- gpt-3\n" +
                "- davinci\n" +
                "- gpt-3.5-turbo\n" +
                "- gpt-4o\n" +
                "- gpt-4o-mini\n" +
                "- chatgpt\n" +
                "\nUsage: .gpt gpt-4 hallo"
            );
        }

        const modelMap = {
            "gpt-4": "GPT-4",
            "gpt-3": "GPT-3",
            "davinci": "Da Vinci GPT",
            "gpt-3.5-turbo": "GPT-3.5 Turbo",
            "gpt-4o": "GPT-4o",
            "gpt-4o-mini": "GPT-4o Mini",
            "chatgpt": "ChatGPT (GPT-3.5 Turbo)"
        };

        let modelType, modelName;
        const queryParts = text.split(" ");
        if (queryParts.length < 2) {
            return m.reply("Please use `.gpt <model> <your prompt>`.\nExample: .gpt gpt-4o halo apa kabar?");
        }
        modelType = queryParts[0].toLowerCase();
        modelName = modelMap[modelType];
        const query = queryParts.slice(1).join(" ");

        if (!modelName) {
            return m.reply(
                "Invalid model type.\n\nList model yang tersedia:\n" +
                Object.keys(modelMap).map(x => `- ${x}`).join('\n') +
                "\n\nUsage: .gpt <model> <your prompt>"
            );
        }

        try {
            let response = await api.get("/chatgpt", { 
                q: query, 
                model: modelType 
            });

            if (response.status === "Success" || response.status === "success") {
                const result = response.result;
                await m.reply(`*[ ${modelName} ]*\n${result}`);
            } else {
                throw new Error(`Failed to fetch ${modelName} result. Status: ${response.status}`);
            }
        } catch (error) {
            console.error("Error fetching GPT result:", error);
            await m.reply("Failed to fetch GPT result. Please try again later.");
        }
    },

    failed: "Failed to execute the %cmd command\n%error",
    wait: null,
    done: null,
};