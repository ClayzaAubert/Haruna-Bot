import { performance } from "perf_hooks";
import os from "os";

export default {
	command: ["ping", "p"],
	description: "Get the bot response time.",
	category: "Others",
	owner: false,
	admin: false,
	hidden: false,
	limit: false,
	group: false,
	private: false,

	haruna: async function (m, { sock }) {
		const old = performance.now();
		const ram = (os.totalmem() / Math.pow(1024, 3)).toFixed(2) + " GB";
		const free_ram = (os.freemem() / Math.pow(1024, 3)).toFixed(2) + " GB";

		m.reply(`\`\`\`Server Information

- ${os.cpus().length} CPU: ${os.cpus()[0].model}

- Uptime: ${Math.floor(os.uptime() / 86400)} days
- Ram: ${free_ram}/${ram}
- Speed: ${(performance.now() - old).toFixed(5)} ms\`\`\``);
	},

	failed: "Failed to haruna the %cmd command\n\n%error",
	wait: null,
	done: null,
};
