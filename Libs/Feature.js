import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readdirSync, readFileSync } from "node:fs";
import { importFromString } from "import-from-string";
import chokidar from "chokidar";
import { Print } from "./Print.js";
import { Feature } from "../Config/Schema.js";
import path from "node:path";

class Features {
	constructor() {
		this.isInit = false;
		this.__dirname = dirname(fileURLToPath(import.meta.url));
		this.folder = join(this.__dirname, "..", "Features");
		this.plugins = {};
	}

	async init() {
		if (this.isInit) {
			return;
		}

		const files = this.readRecursive(this.folder);

		for (const file of files) {
			await this.importFile(file);
		}

		this.watch();
		this.isInit = true;

		const relativePaths = Object.keys(this.plugins).map((file) =>
			path.relative(this.folder, file)
		);
		Print.success(relativePaths);
	}

	readRecursive(dirPath) {
		let files = [];
		const entries = readdirSync(dirPath, { withFileTypes: true });

		entries.forEach((entry) => {
			const entryPath = join(dirPath, entry.name);
			if (entry.isDirectory()) {
				files = files.concat(this.readRecursive(entryPath)); // Recursively read subdirectory
			} else if (entry.isFile() && entry.name.endsWith(".js")) {
				files.push(entryPath); // Add JavaScript file to the list
			}
		});

		return files;
	}

	async importFile(file) {
		const isWindows = process.platform === "win32";
		const timestamp = Date.now();
		const filePath = isWindows ? `file:///${file}` : `file://${file}`;

		if (this.plugins[file]) {
			Print.info(
				`File ${path.relative(this.folder, file)} has changed. Re-importing...`
			);
			delete this.plugins[file];
		}

		try {
			const importedModule = (await import(filePath)).default;
			this.plugins[file] = await this.parser(importedModule, file);
			this.plugins[file].filePath = file;
		} catch (error) {
			Print.error(`Failed to import ${path.relative(this.folder, file)}`);
			console.error(error);
		}
	}

	async parser(module, file) {
		const keys = Object.keys(Feature);
		for (const key of keys) {
			if (!(key in module)) {
				Print.warn(`Feature ${path.relative(this.folder, file)} is missing the ${key}`);
			}
		}
		const feature = module.haruna.toString("utf-8");
		const newExecute = `${feature.slice(0, feature.length - 1)}try { this.callback() } catch { };}`;

		const moduleStr = readFileSync(file, "utf-8").replace(feature, newExecute);
		const newModule = (
			await importFromString(moduleStr, {
				dirname: dirname(file),
			})
		).default;
		return newModule;
	}

	watch() {
		const watcher = chokidar.watch(this.folder, { persistent: true, ignoreInitial: true });

		watcher.on('change', (file) => {
			if (file.endsWith(".js")) {
				Print.info(
					`File ${path.relative(this.folder, file)} has changed. Re-importing...`
				);
				this.importFile(file);
			}
		});

		watcher.on('unlink', (file) => {
			const deletedFile = Object.keys(this.plugins).find(
				(key) => this.plugins[key].filePath === file
			);
			if (deletedFile) {
				Print.info(
					`File ${path.relative(this.folder, file)} has been removed. Deleting...`
				);
				delete this.plugins[deletedFile];
			}
		});
	}
}

export default new Features();
