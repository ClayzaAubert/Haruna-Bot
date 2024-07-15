import fs, { accessSync } from "fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

export default {
	command: ["getfeature", "getplug", "gp"],
	description: "Grab message feature.",
	category: "Owner",
	owner: true,
	admin: false,
	hidden: false,
	limit: false,
	group: false,
	private: false,

	haruna: async function(m, { feature, text, usedPrefix, command }) {
		const __filename = fileURLToPath(import.meta.url);
		const __dirname = path.dirname(__filename);
		const baseDir = path.join(__dirname, "..", "..", "Features"); // Path to the 'Features' directory

		// Function to recursively list all files in a directory
		function listAllFiles(dir) {
			let files = [];
			const entries = fs.readdirSync(dir, { withFileTypes: true });
			entries.forEach((entry) => {
				const fullPath = path.join(dir, entry.name);
				if (entry.isDirectory()) {
					files = files.concat(listAllFiles(fullPath)); // Recursively list files in subdirectories
				} else {
					files.push(fullPath);
				}
			});
			return files;
		}

		if (!text) {
			// Jika tidak ada teks yang diberikan, tampilkan daftar file JavaScript dalam folder dan subfolder 'Features'
			let listFiles = listAllFiles(baseDir)
				.filter((file) => file.endsWith(".js"))
				.map((file) => `*[File]* ${path.relative(baseDir, file)}`); // Get relative path from the base directory

			if (listFiles.length === 0) {
				return m.reply(
					`Tidak ada file JavaScript (.js) dalam folder dan subfolder 'Features'`
				);
			}

			return m.reply(
				`Daftar file JavaScript dalam folder dan subfolder 'Features':\n\n${listFiles.join("\n")}`
			);
		}

		let itemPath = path.join(baseDir, text);
		if (!fs.existsSync(itemPath)) {
			return m.reply(
				`'${text}' tidak ditemukan dalam folder dan subfolder 'Features'`
			);
		}

		if (fs.statSync(itemPath).isDirectory()) {
			// Jika teks yang diberikan adalah nama folder, tampilkan daftar file JavaScript dalam folder tersebut
			let listFiles = listAllFiles(itemPath)
				.filter((file) => file.endsWith(".js"))
				.map((file) => `*[File]* ${path.relative(itemPath, file)}`); // Get relative path from the folder

			if (listFiles.length === 0) {
				return m.reply(`Tidak ada file JavaScript (.js) dalam folder '${text}'`);
			}

			return m.reply(
				`Daftar file JavaScript dalam folder '${text}':\n${listFiles.join("\n")}`
			);
		} else if (text.endsWith(".js")) {
			// Jika teks yang diberikan adalah nama file JavaScript, baca dan kirimkan isinya
			let fileContent = fs.readFileSync(itemPath, "utf8");
			return m.reply(`${fileContent}`);
		} else {
			return m.reply(
				`'${text}' bukan folder dan bukan file JavaScript (.js) dalam folder dan subfolder 'Features'`
			);
		}
	},
	failed: "Failed to haruna the %cmd command\n%error",
	wait: null,
	done: null,
};
