import { spawn } from "child_process";

export default {
	command: ["toimg"],
	description: "Convert sticker to media",
	category: "Others",
	owner: false,
	group: false,
	admin: false,
	hidden: false,
	limit: false,
	private: false,

	/**
	 * @param {import("../../Utils/Messages").ExtendedWAMessage} m - The message object.
	 * @param {import("../Handler").miscOptions}
	 */
	haruna: async function (m, { sock }) {
		const q = m.quoted ? m.quoted : m;
		const mime = q.mtype || "";

		if (!/webp|sticker/i.test(mime)) {
			return m.reply("Please reply/send a sticker with the command");
		}

		const media = await q.download();
		const buffer = Buffer.isBuffer(media) ? media : Buffer.from(media, "utf-8");

		function convert() {
			return new Promise((resolve, reject) => {
				try {
					const chunks = [];
					const command = spawn("convert", ["webp:-", "png:-"]);
					command
						.on("error", (e) => reject(e))
						.stdout.on("data", (chunk) => chunks.push(chunk));
					command.stdin.write(buffer);
					command.stdin.end();
					command.on("exit", () => resolve(Buffer.concat(chunks)));
				} catch (err) {
					reject(err);
				}
			});
		}

		const convertedImage = await convert(buffer);

		await sock.sendMessage(
			m.chat,
			{
				image: convertedImage,
			},
			{ quoted: m }
		);
	},

	failed: "Failed to haruna the %cmd command\n%error",
	wait: null,
	done: null,
};
