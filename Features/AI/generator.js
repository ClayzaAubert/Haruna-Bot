const validModels = [
    "story-prompt-generator",
    "story-character-generator",
    "plot-generator",
    "backstory-generator",
    "book-title-generator",
    "ai-comic-generator",
    "dialogue-generator",
    "poem-generator",
    "song-lyrics-generator",
    "world-building-generator",
    "mystery-plot-generator",
    "romantic-plot-generator",
    "adventure-plot-generator",
    "dialogue-scene-generator",
    "fairy-tale-generator",
    "superhero-creation",
    "villain-creation",
    "historical-fiction-generator",
    "quote-generator",
    "creative-writing-prompt",
    "dialogue-exercise",
    "dystopian-world-generator",
    "character-relationship-generator",
    "alternate-history-generator",
    "magical-creature-generator",
    "urban-fantasy-plot-generator",
    "mythology-generator",
    "adventure-hero-generator",
    "thriller-plot-generator",
    "horror-story-generator",
    "sci-fi-plot-generator",
    "comedy-skit-generator"
];

export default {
    command: ["story"],
    description: "AI Story Generator (multi-model)",
    category: "AI",
    owner: false,
    admin: false,
    hidden: false,
    limit: false,
    group: false,
    private: false,

    haruna: async function (m, { sock, api, text }) {
        if (!text) {
            return m.reply(
                `Usage: .story PROMPT|MODEL\n\nExample: .story A detective on Mars|mystery-plot-generator\n\nValid models:\n${validModels.join(", ")}`
            );
        }

        const [prompt, model] = text.split("|").map(s => s && s.trim());

        if (!prompt || !model) {
            return m.reply(
                `Please provide both PROMPT and MODEL separated by '|'.\n\nExample: .story A detective on Mars|mystery-plot-generator\n\nValid models:\n${validModels.join(", ")}`
            );
        }

        if (!validModels.includes(model)) {
            return m.reply(
                `Invalid model.\nChoose from:\n${validModels.join(", ")}`
            );
        }

        try {
            const res = await api.get("/generator", { q: prompt, model });
            if (res.status === "Failed") {
                return m.reply(res.result || "Failed to generate story.");
            }
            await sock.sendMessage(m.chat, { text: res.result }, { quoted: m });
        } catch (err) {
            await m.reply("Error: Failed to contact generator API.");
            console.error("Generator error:", err);
        }
    },

    failed: "Failed to execute the %cmd command\n%error",
    wait: ["Please wait %tag", "Hold on %tag, fetching response"],
    done: null,
};