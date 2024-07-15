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
			return m.reply(`> Model List :\n- maelyn\n- simi\n- llama\n- claude\n- perplexity\n- thinkany\n\nUsage : .ai simi hallo`);
		}

		let endpoint;
		let modelName;

		const queryParts = text.split(" ");
		const modelType = queryParts[0].toLowerCase();
		const query = queryParts.slice(1).join(" ");

		switch (modelType) {
			case "maelyn":
				endpoint = "/api/maelyngpt";
				modelName = "Maelyn AI";
				break;
			case "simi":
				endpoint = "/api/simi";
				modelName = "SimSimi";
				break;
			case "llama":
				endpoint = "/api/llama";
				modelName = "Llama AI";
				break;
            case "claude":
				endpoint = "/api/claude";
				modelName = "Claude AI";
				break;
            case "perplexity":
				endpoint = "/api/perplexity";
				modelName = "Perpelexity AI";
				break;
            case "thinkany":
				endpoint = "/api/thinkanyai";
				modelName = "Thinkany AI";
				break;
			default:
				return m.reply("Invalid model type. Please use `.ai maelyn QUERY`, `.ai simi QUERY`, `.ai llama QUERY`, `.ai claude QUERY`, `.ai perplexity QUERY`, or `.ai thinkany QUERY`.");
		}

		try {
			const response = await api.get(endpoint, { q: query });

			if (response.status === "Success") {
				const result = response.result;
				await m.reply(`[${modelName}]\n${result}`);
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
