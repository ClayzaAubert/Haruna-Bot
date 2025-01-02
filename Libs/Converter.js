import ffmpeg from "fluent-ffmpeg";
import crypto from "crypto";
import { join } from "path";
import { tmpdir } from "os";
import { existsSync, readFileSync, unlinkSync } from "fs";
import { Readable } from "stream";
import { fileTypeFromBuffer } from "file-type";

const supported_audio_args = {
	"3g2": [
		"-vn",
		"-c:a",
		"libopus",
		"-b:a",
		"128k",
		"-vbr",
		"on",
		"-compression_level",
		"10",
	],
	"3gp": [
		"-vn",
		"-c:a",
		"libopus",
		"-b:a",
		"128k",
		"-vbr",
		"on",
		"-compression_level",
		"10",
	],
	aiff: ["-vn", "-c:a", "pcm_s16be"],
	amr: ["-vn", "-c:a", "libopencore_amrnb", "-ar", "8000", "-b:a", "12.2k"],
	flac: ["-vn", "-c:a", "flac"],
	m4a: ["-vn", "-c:a", "aac", "-b:a", "128k"],
	m4r: ["-vn", "-c:a", "libfdk_aac", "-b:a", "64k"],
	mka: ["-vn", "-c:a", "libvorbis", "-b:a", "128k"],
	mp3: ["-vn", "-c:a", "libmp3lame", "-q:a", "2"],
	ogg: ["-vn", "-c:a", "libvorbis", "-q:a", "3"],
	opus: [
		"-vn",
		"-c:a",
		"libopus",
		"-b:a",
		"128k",
		"-vbr",
		"on",
		"-compression_level",
		"10",
	],
	wav: ["-vn", "-c:a", "pcm_s16le"],
	wma: ["-vn", "-c:a", "wmav2", "-b:a", "128k"],
};
/**
 * Converts the media buffer to a stream.
 * @param {Buffer} buffer - The media buffer to convert.
 * @returns {Readable} - The converted media stream.
 * @private
 */
export function bufferToStream(buffer) {
	const stream = new Readable();
	stream.push(buffer);
	stream.push(null);
	return stream;
}

/**
 * Converts the media buffer to a webp format using ffmpeg.
 * @param {Buffer} mediaBuffer - The media buffer to convert.
 * @param {string[]} args - The additional arguments for ffmpeg.
 * @param {string} format - The format to convert to (default: "webp").
 * @returns {Promise<Buffer>} - The converted media buffer.
 */
export async function convert(mediaBuffer, args, format = null) {
	const tempPath = join(tmpdir(), crypto.randomBytes(16).toString("hex"));
	return new Promise((resolve, reject) => {
		const ffmpegProcess = ffmpeg()
			.input(bufferToStream(mediaBuffer))
			.addOutputOptions(args)
			.format(format)
			.on("end", () => {
				if (existsSync(tempPath)) {
					const buffer = readFileSync(tempPath);
					unlinkSync(tempPath);
					resolve(buffer);
				}
			})
			.on("error", (err) => {
				reject(err);
			});
		ffmpegProcess.save(tempPath);
	});
}

/**
 *
 * @param {Buffer} mediaBuffer - The audio buffer to convert.
 * @param {string} ext - The file extension of the audio.
 * @returns {Promise<Buffer>} - The converted audio buffer.
 * @throws {Error} - If the file type is not supported.
 */
export async function to_audio(mediaBuffer, ext = null) {
	if (!ext) {
		ext = (await fileTypeFromBuffer(mediaBuffer)).ext;
	}
	if (!supported_audio_args[ext]) {
		throw new Error(`Unsupported file type ${ext}`);
	}
	const args = supported_audio_args[ext];
	const audio = await convert(mediaBuffer, args, ext);
	return audio;
}
