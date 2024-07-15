import axios from "axios";
import { fileTypeFromBuffer } from "file-type";

/**
 * @abstract
 * @class Provider
 * @classdesc Abstract class for providers
 * @property {Function} form - Create a new FormData instance
 * @property {Function} upload - Upload a buffer to a provider
 * @throws {Error} Abstract class cannot be instantiated
 */
class Provider {
	/**
	 * @constructor
	 * @throws {Error} Abstract class cannot be instantiated
	 */
	constructor() {
		if (this.constructor === Provider) {
			throw new Error("Abstract class cannot be instantiated");
		}
	}

	/**
	 * Create a new FormData instance
	 * @param {any[]} args - Arguments to pass to FormData.append
	 * @returns {FormData} A new FormData instance
	 */
	form(...args) {
		const form = new FormData();
		if (args) {
			form.append(...args);
		}
		return form;
	}

	/**
	 * Upload a buffer to a provider
	 * @param {Buffer} buffer - The buffer to upload
	 * @returns {Promise<string>} The URL of the uploaded file
	 */
	async upload(buffer) {
		throw new Error("Method 'upload' must be implemented");
	}
}

/**
 * @class TelegraphProvider
 * @classdesc Upload a buffer to telegra.ph
 * @extends Provider
 */
class TelegraphProvider extends Provider {
	/**
	 * Upload a buffer to telegra.ph
	 * @param {Buffer} buffer - The buffer to upload
	 * @returns {Promise<string>} The URL of the uploaded file
	 */
	async upload(buffer) {
		const { mime, ext } = await fileTypeFromBuffer(buffer);
		const blob = new Blob([buffer], { type: mime });
		const form = this.form("file", blob, `file.${ext}`);
		const { data } = await axios.post("https://telegra.ph/upload", form, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return "https://telegra.ph" + data[0].src;
	}
}

/**
 * @class QuaxProvider
 * @classdesc Upload a buffer to qu.ax
 * @extends Provider
 */
class QuaxProvider extends Provider {
	/**
	 * Upload a buffer to qu.ax
	 * @param {Buffer} buffer - The buffer to upload
	 * @returns {Promise<string>} The URL of the uploaded file
	 */
	async upload(buffer) {
		const { mime, ext } = await fileTypeFromBuffer(buffer);
		const blob = new Blob([buffer], { type: mime });
		const form = this.form("files[]", blob, `file.${ext}`);
		const { data } = await axios.post("https://qu.ax/upload.php", form, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return data.files[0].url;
	}
}

/**
 * @class FreeImageProvider
 * @classdesc Upload a buffer to freeimage.host
 * @extends Provider
 */
class FreeImageProvider extends Provider {
	/**
	 * Upload a buffer to freeimage.host
	 * @param {Buffer} buffer - The buffer to upload
	 * @returns {Promise<string>} The URL of the uploaded file
	 */
	async upload(buffer) {
		const { data: html } = await axios
			.get("https://freeimage.host/")
			.catch(() => null);
		const token = html.match(/PF.obj.config.auth_token = "(.+?)";/)[1];
		const { mime, ext } = await fileTypeFromBuffer(buffer);
		const blob = new Blob([buffer], { type: mime });
		const form = this.form("source", blob, `file.${ext}`);
		const options = {
			type: "file",
			action: "upload",
			timestamp: (Date.now() / 1000).toString(),
			auth_token: token,
			nsfw: "0",
		};
		for (const [key, value] of Object.entries(options)) {
			form.append(key, value);
		}
		const { data } = await axios.post("https://freeimage.host/json", form, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return data.image.url;
	}
}

/**
 * @class TmpFilesProvider
 * @classdesc Upload a buffer to tmpfiles.org
 * @extends Provider
 */
class TmpFilesProvider extends Provider {
	/**
	 * Upload a buffer to tmpfiles.org
	 * @param {Buffer} buffer - The buffer to upload
	 * @returns {Promise<string>} The URL of the uploaded file
	 */
	async upload(buffer) {
		const { mime, ext } = await fileTypeFromBuffer(buffer);
		const blob = new Blob([buffer], { type: mime });
		const form = this.form("file", blob, `file.${ext}`);
		const { data } = await axios.post("https://tmpfiles.org/api/v1/upload", form, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		const url = data.data.url.match(/https:\/\/tmpfiles.org\/(.*)/)[1];
		return "https://tmpfiles.org/dl/" + url;
	}
}

/**
 * @class APIGratisProvider
 * @classdesc Upload a buffer to files.apigratis.site
 * @extends Provider
 */
class ApiGratisProvider extends Provider {
	/**
	 * Upload a buffer to tmpfiles.org
	 * @param {Buffer} buffer - The buffer to upload
	 * @returns {Promise<string>} The URL of the uploaded file
	 */
	async upload(buffer) {
		const { mime, ext } = await fileTypeFromBuffer(buffer);
		const blob = new Blob([buffer], { type: mime });
		const form = this.form("file", blob, `file.${ext}`);
		const { data } = await axios.post("https://files.apigratis.site/upload", form, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return data.result.url;
	}
}

/**
 * @class Uploader
 * @classdesc Upload a buffer to a provider
 * @property {Object} providers - The available providers
 * @method isBuffer - Check if a buffer is a buffer
 * @method upload - Upload a buffer to a provider
 */
class Uploader {
	/**
	 * @constructor
	 */
	constructor() {
		this.providers = {
			telegraph: new TelegraphProvider(),
			quax: new QuaxProvider(),
			freeimage: new FreeImageProvider(),
			tmpfiles: new TmpFilesProvider(),
			apiGratis: new ApiGratisProvider(),
		};
	}

	/**
	 * Check if a buffer is a buffer
	 * @param {Buffer} buffer - The buffer to check
	 * @returns {boolean} Whether the buffer is a buffer
	 */
	isBuffer(buffer) {
		return Buffer.isBuffer(buffer);
	}

	/**
	 * Upload a buffer to a provider
	 * @param {Buffer} buffer - The buffer to upload
	 * @param {string} provider - The provider to upload to
	 * @returns {Promise<string>} The URL of the uploaded file
	 * @throws {Error} Uploader not found
	 * @throws {Error} Buffer is not a buffer
	 * @throws {Error} Error uploading file
	 */
	async upload(buffer, provider) {
		if (!this.providers[provider]) {
			throw new Error("Uploader not found");
		}
		if (!Buffer.isBuffer(buffer)) {
			throw new Error("Buffer is not a buffer");
		}
		try {
			const url = await this.providers[provider].upload(buffer);
			return url;
		} catch (error) {
			throw new Error(error);
		}
	}
}

const uploader = new Uploader();

export default uploader;

export const { telegraph, quax, freeimage, storageNeko, tmpfiles } =
	uploader.providers;
