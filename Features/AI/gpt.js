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
            return m.reply("> GPT Model :\n- 4\n- 3\n- davinci\n- rp\n\nUsage: .gpt 4 hallo");
        }

        let endpoint;
        let modelName;

        const queryParts = text.split(" ");
        const modelType = queryParts[0].toLowerCase();
        const query = queryParts.slice(1).join(" ");

        switch (modelType) {
            case "4":
                endpoint = "/api/chatgpt4";
                modelName = "GPT-4";
                break;
            case "3":
                endpoint = "/api/chatgpt3";
                modelName = "GPT-3";
                break;
            case "davinci":
                endpoint = "/api/davincigpt";
                modelName = "Da Vinci GPT";
                break;
            case "rp":
                endpoint = "/api/gptrp";
                modelName = "GPT Roleplay";
                break;
            default:
                return m.reply("Invalid model type. Please use `.gpt 4 QUERY`, `gpt 3 QUERY`, `gpt davinci QUERY`, or `gpt rp ROLEPLAY_QUERY`.");
        }

        try {
            let response;
            if (modelType === "rp") {
                response = await api.get(endpoint, { q: query, roleplay: "kamu bernama haruna" });
            } else {
                response = await api.get(endpoint, { q: query });
            }

            if (response.status === "Success") {
                const result = response.result;
                await m.reply(`[${modelName}]\n${result}`);
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
