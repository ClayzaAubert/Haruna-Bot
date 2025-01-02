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
            return m.reply("> GPT Model :\n- gpt-4\n- gpt-3\n- davinci\n- gpt-3.5-turbo\n\nUsage: .gpt gpt-4 hallo");
        }

        let modelName;
        const queryParts = text.split(" ");
        const modelType = queryParts[0].toLowerCase();
        const query = queryParts.slice(1).join(" ");

        switch (modelType) {
            case "gpt-4":
                modelName = "GPT-4";
                break;
            case "gpt-3":
                modelName = "GPT-3";
                break;
            case "davinci":
                modelName = "Da Vinci GPT";
                break;
            case "gpt-3.5-turbo":
                modelName = "GPT-3.5 Turbo";
                break;
            default:
                return m.reply("Invalid model type. Please use `.gpt gpt-4 QUERY`, `.gpt gpt-3 QUERY`, `.gpt davinci QUERY`, or `.gpt gpt-3.5-turbo QUERY`.");
        }

        try {
            let response = await api.get("/chatgpt", { 
                q: query, 
                model: modelType 
            });

            if (response.status === "Success") {
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
