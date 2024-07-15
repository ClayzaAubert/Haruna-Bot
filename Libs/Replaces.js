import { fonts, system } from "../Config/Fonts.js";

const FONTS = {
	system,
	...fonts,
};

/**
 * Replaces specific characters in a string with corresponding characters from a font.
 * @param {string} str - The input string to be replaced.
 * @param {string} [fontName="system"] - The name of the font to be used for replacement.
 * @returns {string} - The modified string with replaced characters.
 */
export default function Replace(str, fontName = "system") {
	const font = fonts[fontName];
	if (font) {
		const system = FONTS.system;
		for (let i = 0; i < system.length; i++) {
			str = String(str).replace(new RegExp(system[i], "gi"), font[i]);
		}
	}
	return str;
}
