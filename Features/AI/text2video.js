export default {
	command: ["txt2video"],
	description: "Ubah Text Menjadi video",
	category: "AI",
	owner: false,
	admin: false,
	hidden: false,
	limit: false,
	group: false,
	private: false,

	haruna: async function (m, { sock, api, text }) {
        try {
            if (!text) return m.reply("Masukan Promptnya");
    
            m.reply("Processing...")
    
            const endpoint = "/api/txt2video";
            const res = await api.get(endpoint, { prompt: text });
            if (!res || res.status !== 'Success' || !res.result || !res.result.name) {
                throw new Error("Failed to retrieve anime image. Please try again later.");
            }
    
            let hasil = res.result.name;
    
            sock.sendMessage(
                m.chat,
                { video: { url: hasil }, caption: `*_${res.powered}_*` },
                { quoted: m }
            );
        } catch (e) {
            console.error(e);
            m.reply("Terjadi kesalahan saat memproses permintaan. Mungkin file terlalu besar atau silakan coba lagi nanti.");
        }
	},

	failed: "Failed to haruna the %cmd command\n\n%error",
	wait: null,
	done: null,
};
