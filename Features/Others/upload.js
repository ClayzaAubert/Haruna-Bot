
export default {
	command: ["upload", "tourl"],
	description: "Upload a file",
	category: "Others",
	owner: false,
	group: false,
	admin: false,
	hidden: false,
	limit: false,
	private: false,

	haruna: async function (m, { cdn }) {
		const q = m.quoted ? m.quoted : m;
		const mime = q.message.mimetype || "";
		console.log(mime)
		if (!/webp|image|video|webm/g.test(mime)) {
			return m.reply("Please reply/send an image with the command");
		}
		const media = await q.download();
		const url = await cdn.maelyn(media);
		m.reply(`*Url :* ${url}`);
	},
	failed: "Failed to haruna the %cmd command\n%error",
	wait: null,
	done: null,
};
