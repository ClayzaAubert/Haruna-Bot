const validWritingModes = ["standard", "complex", "creative", "simple"];
const validGenres = ["Science Fiction", "Mystery", "Fantasy", "Descriptive"];

export default {
	command: ["story"],
	description: "Story Generator",
	category: "AI",
	owner: false,
	admin: false,
	hidden: false,
	limit: false,
	group: false,
	private: false,

	haruna: async function (m, { sock, api, text }) {
		if (!text) {
			m.reply("Usage: .story PROMPT|WRITING|GENRE\n\nExample: .story In a small laboratory|standard|Science Fiction");
			return;
		}

		const [prompt, writing, genre] = text.split("|");

		if (!prompt || !writing || !genre) {
			m.reply("Please provide all three parameters: PROMPT, WRITING mode, and GENRE");
			return;
		}

		if (!validWritingModes.includes(writing.trim())) {
			m.reply(`Invalid WRITING mode. Choose from: ${validWritingModes.join(", ")}`);
			return;
		}

		if (!validGenres.includes(genre.trim())) {
			m.reply(`Invalid GENRE. Choose from: ${validGenres.join(", ")}`);
			return;
		}

		const res = await api.get("/api/storygenerator", { topic: prompt, writing: writing.trim(), genre: genre.trim() });

		if (res.status === "Failed") {
			m.reply(res.result);
			return;
		}

		const result = res.result;
		await sock.sendMessage(m.chat, { text: result }, { quoted: m });
	},
	failed: "Failed to execute the %cmd command\n%error",
	wait: ["Please wait %tag", "Hold on %tag, fetching response"],
	done: null,
};
