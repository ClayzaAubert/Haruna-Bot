export default {
	command: ["ai"],
	description: "Chat Dengan AI",
	category: "AI",
	owner: false,
	admin: false,
	hidden: false,
	limit: true,
	group: false,
	private: false,

	haruna: async function (m, { sock, api, text }) {
		if (!text) {
			return m.reply(`> Model List :\n- simi\n- grok\n- llama\n- claude\n- youai\n\nUsage : .ai simi hallo`);
		}

		let endpoint;
		let modelName;

		const queryParts = text.split(" ");
		const modelType = queryParts[0].toLowerCase();
		const query = queryParts.slice(1).join(" ");

		switch (modelType) {
			case "simi":
				endpoint = "/simi";
				modelName = "SimSimi";
				break;
			case "llama":
				endpoint = "/llama";
				modelName = "Llama AI";
				break;
            case "grok":
				endpoint = "/grokai";
				modelName = "Claude AI";
				break;
            case "iask":
				endpoint = "/iaskai";
				modelName = "Perpelexity AI";
				break;
			case "youai":
				endpoint = "/youai";
				modelName = "You AI";
				break;
			default:
				return m.reply("Invalid model type. Please use ```.ai MODEL QUERY```");
		}

		try {
			const response = await api.get(endpoint, { q: query });

			if (response.status === "Success") {
				const result = response.result;
				await m.reply(`*[ ${modelName} ]*\n${result}`);
			} else {
				throw new Error(`Failed to fetch ${modelName} result. Status: ${response.status}`);
			}
		} catch (error) {
			console.error("Error fetching AI result:", error);
			await m.reply("Failed to fetch AI result. Please try again later.");
		}
	},

	failed: "Failed to execute the %cmd command\n%error",
	wait: null,
	done: null,
};
