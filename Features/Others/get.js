import axios from "axios";

export default {
	command: ["get", "fetch"],
	description: "get something from the url",
	category: "Others",
	owner: false,
	admin: false,
	hidden: false,
	limit: false,
	group: false,
	private: false,

	haruna: async function (m, { sock, args }) {
		const url = args[0];
		if (!url) {
			return m.reply("Need url");
		}

		const { data, headers } = await axios
			.get(url, {
				responseType: "arraybuffer",
			})
			.catch((e) => e?.response);

		if (!data || !headers) {
			return m.reply("Failed to fetch the url");
		}

		const mediaMap = {
			image: "image",
			video: "video",
			audio: "audio",
		};

		function getContentType() {
			for (const key in mediaMap) {
				if (headers?.["content-type"]?.includes(mediaMap[key])) {
					return key;
				}
			}
			return null;
		}

		const contentType = getContentType();
		if (contentType) {
			await sock.sendMessage(
				m.chat,
				{ [contentType]: Buffer.from(data) },
				{ quoted: m }
			);
		} else {
			try {
				const json = JSON.parse(data.toString());
				m.reply(JSON.stringify(json, null, 2));
			} catch {
				m.reply(data.toString());
			}
		}
	},

	failed: "Failed to haruna the %cmd command\n%error",
	wait: null,
	done: null,
};
