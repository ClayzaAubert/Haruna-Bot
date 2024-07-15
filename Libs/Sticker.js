import ffmpeg from "fluent-ffmpeg";
import { fileTypeFromBuffer } from "file-type";
import { readFileSync, unlinkSync } from "fs";
import pixelWidth from "string-pixel-width";
import gm from "gm";
import { tmpdir } from "os";
import { join } from "path";
import crypto from "crypto";
import webp from "node-webpmux";
import { outputOptionsArgs } from "../Config/Sticker.js";
import { convert } from "./Converter.js";

/**
 * Generates the metadata for the sticker.
 * @param {Object} options - The options for the sticker metadata.
 * @returns {Buffer} - The metadata buffer.
 */
function metadata(options) {
	const loadDataExif = Buffer.concat([
		Buffer.from([
			0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07,
			0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
		]),
		Buffer.from(JSON.stringify(options), "utf-8"),
	]);
	loadDataExif.writeUIntLE(
		Buffer.from(JSON.stringify(options), "utf-8").length,
		14,
		4
	);
	return loadDataExif;
}

/**
 * Generates the exif data for the sticker.
 * @param {string} packname - The pack name for the sticker.
 * @param {string} author - The author of the sticker.
 * @param {string[]} emojis - The emojis associated with the sticker.
 * @returns {Object} - The exif data object.
 */
function exif(packname, author, emojis) {
	return {
		"sticker-pack-id":
			"com.snowcorp.stickerly.android.stickercontentprovider b5e7275f-f1de-4137-961f-57becfad34f2",
		"sticker-pack-name": packname,
		"sticker-pack-publisher": author,
		emojis: Array.isArray(emojis) ? emojis : [emojis],
		"api-url": "https://api.maelyn.tech",
		"android-app-store-link":
			"https://play.google.com/store/apps/details?id=com.snowcorp.stickerly.android",
		"ios-app-store-link":
			"https://play.google.com/store/apps/details?id=com.snowcorp.stickerly.android",
	};
}

/**
 * Gets the font size for the text.
 * @param {string} text - The text to get the font size for.
 * @param {number} width - The width of the sticker.
 * @param {number} height - The height of the sticker.
 * @returns {Object} - The font size and width of the text.
 * @private
 */
function getFontSize(text, width, height) {
	let fontSize = 100;
	let textWidth = 0;

	while (true) {
		textWidth = pixelWidth(text, { size: fontSize, font: "impact" });
		if (textWidth < width - 15 && fontSize < height / 10) {
			break;
		}
		fontSize -= 2;
	}

	return { fontSize: fontSize, width: textWidth };
}

/**
 * Represents a Sticker object.
 * @class
 */
class Sticker {
	/**
	 * Constructs a new Sticker object.
	 * @constructor
	 */
	constructor() {
		this.ffmpeg = ffmpeg;
		this.packname = "Clayza Aubert";
		this.author = "Clayza Aubert";
	}

	/**
	 * Creates a sticker from the media buffer.
	 * @param {Buffer} mediaBuffer - The media buffer to create the sticker from.
	 * @param {Object} options - The options for creating the sticker.
	 * @param {string} options.packname - The pack name for the sticker.
	 * @param {string} options.author - The author of the sticker.
	 * @param {string[]} options.emojis - The emojis associated with the sticker.
	 * @returns {Promise<Buffer>} - The created sticker buffer.
	 */
	async create(
		mediaBuffer,
		{ packname = this.packname, author = this.author, emojis = ["❤️"] }
	) {
		const { mime } = (await fileTypeFromBuffer(mediaBuffer)) || {};
		if (!mime) {
			throw new Error("Invalid file type");
		}

		const args = mime.includes("image")
			? outputOptionsArgs.image
			: outputOptionsArgs.video;
		const webpBuffer =
			(!mime.includes("webp") && (await convert(mediaBuffer, args, "webp"))) ||
			mediaBuffer;
		const image = new webp.Image();
		await image.load(webpBuffer);
		const exifData = metadata(exif(packname, author, emojis));
		image.exif = exifData;
		return await image.save(null);
	}

	/**
	 * Adds text to the sticker like a meme.
	 * @param {Buffer} stickerBuffer - The sticker buffer to add text to.
	 * @param {string} upperText - The upper text to add to the sticker.
	 * @param {string} bottomText - The bottom text to add to the sticker.
	 * @returns {Promise<Buffer>} - The sticker buffer with the added text.
	 */
	async stickerMeme(stickerBuffer, upperText = "", bottomText = "") {
		const tempPath = join(
			tmpdir(),
			crypto.randomBytes(16).toString("hex") + ".webp"
		);
		return new Promise((resolve, reject) => {
			gm(stickerBuffer).size((err, size) => {
				if (err) {
					reject(err);
				}
				const width = size.width;
				const height = size.height;

				const topFontSize = getFontSize(upperText, width, height);
				const bottomFontSize = getFontSize(bottomText, width, height);
				gm(stickerBuffer)
					.coalesce()
					.font("./impact.ttf")
					.stroke("#000000")
					.fill("#ffffff")
					.fontSize(topFontSize.fontSize)
					.strokeWidth(1.5)
					.drawText(0, 15, upperText, "North")
					.fontSize(bottomFontSize.fontSize)
					.drawText(0, height - 15 - bottomFontSize.fontSize, bottomText, "North")
					.write(tempPath, (err) => {
						if (err) {
							reject(err);
						} else {
							const buffer = readFileSync(tempPath);
							unlinkSync(tempPath);
							resolve(buffer);
						}
					});
			});
		});
	}
}

export default new Sticker();
