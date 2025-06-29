import { performance } from "perf_hooks";
import os from "os";

function formatUptime(seconds) {
	const d = Math.floor(seconds / (3600 * 24));
	const h = Math.floor((seconds % (3600 * 24)) / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = Math.floor(seconds % 60);
	return `${d}d ${h}h ${m}m ${s}s`;
}

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
		const start = performance.now();
		const cpus = os.cpus();
		const totalRAM = os.totalmem();
		const freeRAM = os.freemem();
		const usedRAM = totalRAM - freeRAM;
		const ramUsagePercent = ((usedRAM / totalRAM) * 100).toFixed(2);

		const responseTime = (performance.now() - start).toFixed(3);
		const uptime = formatUptime(os.uptime());

		const localTime = new Date().toLocaleString("id-ID", {
			timeZone: "Asia/Jakarta",
			hour12: false,
		});

		const loadAvg = os.loadavg().map(v => v.toFixed(2)).join(", ");

		let username;
		try {
			username = os.userInfo().username;
		} catch (e) {
			username = process.env.USER || process.env.USERNAME || "Unknown";
		}

		m.reply(
`🔰 *Haruna Status Report*

📡 *Response Time*  : ${responseTime} ms
🕓 *Server Time*    : ${localTime}
⏱️ *Uptime*         : ${uptime}

🧠 *System Info*
• Hostname          : ${os.hostname()}
• OS                : ${os.type()} ${os.release()} (${os.platform()} ${os.arch()})
• CPU               : ${cpus[0].model}
• Cores/Threads     : ${cpus.length} cores / ${cpus.length * 2} threads
• Load Average      : ${loadAvg}

🗃️ *Memory Usage*
• Total RAM         : ${(totalRAM / 1024 ** 3).toFixed(2)} GB
• Used RAM          : ${(usedRAM / 1024 ** 3).toFixed(2)} GB
• Free RAM          : ${(freeRAM / 1024 ** 3).toFixed(2)} GB
• RAM Usage         : ${ramUsagePercent}%

📦 *Process Info*
• Node.js Version   : ${process.version}
• V8 Engine         : ${process.versions.v8}
• PID               : ${process.pid}
• Uptime Process    : ${formatUptime(process.uptime())}
• Working Dir       : ${process.cwd()}
• Active Handles    : ${process._getActiveHandles().length}
• Active Requests   : ${process._getActiveRequests().length}
• User              : ${username}
• Baileys           : ${process.env.Baileys || "Unknown"}

✅ *Bot is running smoothly!*`
		);
	},

	failed: "Failed to haruna the %cmd command\n\n%error",
	wait: null,
	done: null,
};
