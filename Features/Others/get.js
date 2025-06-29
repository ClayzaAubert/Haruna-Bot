import axios from "axios";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import os from "os";
import { execSync } from "child_process";

function checkDiskUsage() {
	try {
		const output = execSync("df -h /home/container").toString();
		const match = output.match(/(\d+)%/);
		if (!match) return true;
		const used = parseInt(match[1]);
		return used < 95; // aman jika <95%
	} catch {
		return true; // fallback aman
	}
}

export default {
	command: ["get", "fetch"],
	description: "Fetch URL (media, JSON, or HLS stream)",
	category: "Others",
	owner: false,
	admin: false,
	hidden: false,
	limit: false,
	group: false,
	private: false,

	haruna: async function (m, { sock, args }) {
		const url = args[0];
		if (!url) return m.reply("⚠️ URL is required.");

		console.log(`[FETCH] Requested URL: ${url}`);

		let response;
		try {
			response = await axios.head(url);
		} catch (e) {
			console.error(`[HEAD FAIL] ${e.message}`);
			return m.reply("❌ Failed to fetch the URL headers.");
		}

		const contentType = response.headers["content-type"] || "";
		console.log(`[INFO] Content-Type: ${contentType}`);

		const outputDir = "/home/container/downloads";
		if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

		// === Handle HLS ===
		if (
			contentType.includes("application/vnd.apple.mpegurl") ||
			url.endsWith(".m3u8")
		) {
			const tempFile = path.join(outputDir, `${crypto.randomUUID()}.mp4`);
			await m.reply("🔄 HLS stream detected. Converting...");

			const ffmpeg = spawn("ffmpeg", [
				"-y",
				"-loglevel", "warning",
				"-protocol_whitelist", "file,http,https,tcp,tls",
				"-timeout", "10000000",
				"-i", url,
				"-map", "0",
				"-c:v", "libx264",
				"-c:a", "aac",
				"-strict", "experimental",
				"-bsf:a", "aac_adtstoasc",
				"-movflags", "+faststart",
				"-shortest",
				"-fs", "50M",
				tempFile,
			]);

			let ffmpegLog = "";
			ffmpeg.stderr.on("data", (data) => {
				const chunk = data.toString();
				ffmpegLog += chunk;
				process.stdout.write(`[FFMPEG] ${chunk}`);
			});

			ffmpeg.on("close", async (code) => {
				console.log(`[FFMPEG] Exit code: ${code}`);

				if (code !== 0 || !fs.existsSync(tempFile)) {
					await m.reply(
						"❌ Failed to convert HLS stream.\n\n" +
						ffmpegLog.split("\n").slice(-5).join("\n")
					);
					try {
						const logPath = tempFile + ".log.txt";
						if (ffmpegLog.length < 5_000_000) {
							fs.writeFileSync(logPath, ffmpegLog);
							await sock.sendMessage(m.chat, {
								document: fs.readFileSync(logPath),
								mimetype: "text/plain",
								fileName: "ffmpeg-error-log.txt"
							}, { quoted: m });
							fs.unlinkSync(logPath);
						}
					} catch (err) {
						console.warn("[LOG FAIL]", err.message);
						await m.reply("⚠️ Could not save error log. Disk might be full.");
					}
					return;
				}

				if (!checkDiskUsage()) {
					await m.reply("⚠️ Disk hampir penuh. Tidak bisa mengirim video.");
					return;
				}

				await sock.sendMessage(
					m.chat,
					{
						video: { url: tempFile },
						mimetype: "video/mp4",
						fileName: "stream.mp4",
						caption: `✅ HLS stream converted.`,
					},
					{ quoted: m }
				);

				setTimeout(() => {
					try {
						if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
						console.log(`[CLEANUP] Deleted: ${tempFile}`);
					} catch (err) {
						console.warn(`[CLEANUP FAIL] ${err.message}`);
					}
				}, 10_000);
			});
			return;
		}

		// === Handle normal media / text ===
		try {
			const { data, headers } = await axios.get(url, {
				responseType: "arraybuffer",
			});

			const mediaMap = {
				image: "image",
				video: "video",
				audio: "audio",
			};

			for (const type in mediaMap) {
				if (headers["content-type"]?.includes(mediaMap[type])) {
					console.log(`[MEDIA] Sending ${type}`);
					return await sock.sendMessage(
						m.chat,
						{ [type]: Buffer.from(data) },
						{ quoted: m }
					);
				}
			}

			try {
				const json = JSON.parse(data.toString());
				m.reply(JSON.stringify(json, null, 2));
			} catch {
				m.reply(data.toString());
			}
		} catch (e) {
			console.error(`[ERROR] ${e.message}`);
			m.reply("❌ Failed to fetch content:\n" + e.message);
		}
	},

	failed: "Failed to haruna the %cmd command\n%error",
	wait: null,
	done: null,
};
