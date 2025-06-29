import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readdirSync } from "node:fs";
import chokidar from "chokidar";
import path from "node:path";
import { Print } from "./Print.js";

class Features {
	constructor() {
		this.isInit = false;
		this.__dirname = dirname(fileURLToPath(import.meta.url));
		this.folder = join(this.__dirname, "..", "Features");
		this.plugins = {};
	}

	async init(sock = null) {
		if (this.isInit) return;

		const files = this.readRecursive(this.folder);

		for (const file of files) {
			await this.importFile(file, sock);
		}

		this.watch(sock);
		this.isInit = true;

		const relativePaths = Object.keys(this.plugins).map((file) =>
			path.relative(this.folder, file)
		);
		Print.success("Loaded features:", relativePaths);
	}

	readRecursive(dirPath) {
		let files = [];
		const entries = readdirSync(dirPath, { withFileTypes: true });

		for (const entry of entries) {
			const entryPath = join(dirPath, entry.name);
			if (entry.isDirectory()) {
				files = files.concat(this.readRecursive(entryPath));
			} else if (entry.isFile() && entry.name.endsWith(".js")) {
				files.push(entryPath);
			}
		}
		return files;
	}

	async importFile(file, sock = null) {
		const isWindows = process.platform === "win32";
		const filePath = isWindows ? `file:///${file}` : `file://${file}`;

		// Hapus cache import sebelumnya (jika ada)
		if (this.plugins[file]) {
			Print.info(`Reloading feature: ${path.relative(this.folder, file)}`);
			delete this.plugins[file];
		}

		try {
			// force reload with query param to bust cache
			const module = await import(`${filePath}?update=${Date.now()}`);
			const plugin = module?.default;

			if (!plugin || typeof plugin !== "object") {
				Print.warn(`No valid default export in ${path.relative(this.folder, file)}`);
				return;
			}

			this.plugins[file] = plugin;
			this.plugins[file].filePath = file;

			// Jalankan fungsi 'all' jika tersedia
			if (typeof plugin.all === "function") {
				Print.info(`Running 'all()' from ${path.relative(this.folder, file)}`);
				await plugin.all(null, sock);
			}
		} catch (error) {
			Print.error(`Failed to import ${path.relative(this.folder, file)}`);
			console.error(error);
		}
	}

	watch(sock = null) {
		const watcher = chokidar.watch(this.folder, {
			persistent: true,
			ignoreInitial: true,
		});

		watcher.on("change", (file) => {
			if (file.endsWith(".js")) {
				this.importFile(file, sock);
			}
		});

		watcher.on("add", (file) => {
			// === FIX: tambahkan handler untuk file baru ===
			if (file.endsWith(".js") && !this.plugins[file]) {
				Print.info(`New file detected: ${path.relative(this.folder, file)}`);
				this.importFile(file, sock);
			}
		});

		watcher.on("unlink", (file) => {
			if (this.plugins[file]) {
				Print.info(`Deleted: ${path.relative(this.folder, file)}`);
				delete this.plugins[file];
			}
		});
	}
}

export default new Features();