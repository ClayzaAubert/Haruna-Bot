/**
 * Sticker Config for creating sticker.
 * @constant {Object} args - The arguments for ffmpeg addOutputOptions
 * @property {string[]} image - The image arguments
 * @property {string[]} video - The video arguments
 */
export const outputOptionsArgs = {
	image: [
		"-vcodec",
		"libwebp",
		"-vf",
		"scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse",
	],
	video: [
		"-vcodec",
		"libwebp",
		"-vf",
		"scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse",
		"-loop",
		"0",
		"-ss",
		"00:00:00",
		"-t",
		"00:00:20",
		"-preset",
		"default",
		"-an",
		"-vsync",
		"0",
	],
};
