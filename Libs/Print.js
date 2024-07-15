import chalk from "chalk";

/**
 * A utility class for printing formatted messages to the console.
 * @hideconstructor
 */
export class Print {
	/**
	 * The chalk library for applying colors to messages.
	 * @type {import("chalk")}
	 */
	static chalk = chalk;

	/**
	 * The private log method for printing messages to the console.
	 * @type {(...print: any[]) => void}
	 * @private
	 */
	static _log = (...print) => {
		console.log(...print);
	};

	/**
	 * Checks if the given value is an object.
	 * @param {any} obj - The value to check.
	 * @returns {boolean} - True if the value is an object, false otherwise.
	 */
	static isObject(obj) {
		return obj !== null && typeof obj === "object";
	}

	/**
	 * Formats the given arguments into a single message string.
	 * @param {...any} args - The arguments to format.
	 * @returns {string} - The formatted message.
	 */
	static parser(...args) {
		return args
			.map((arg) => (Print.isObject(arg) ? JSON.stringify(arg, null, 2) : arg))
			.join(" ")
			.trim();
	}

	/**
	 * Prints a message with the specified color to the console.
	 * @param {string} color - The color to apply to the message.
	 * @param {...any} message - The message to print.
	 */
	static printWithColor(color, ...message) {
		this._log(Print.chalk[color](Print.parser(...message)));
	}

	/**
	 * Prints an error message to the console.
	 * @param {...any} message - The message to print.
	 */
	static error(...message) {
		this.printWithColor("red", ...message);
	}

	/**
	 * Prints a success message to the console.
	 * @param {...any} message - The message to print.
	 */
	static success(...message) {
		this.printWithColor("green", ...message);
	}

	/**
	 * Prints an informational message to the console.
	 * @param {...any} message - The message to print.
	 */
	static info(...message) {
		this.printWithColor("blue", ...message);
	}

	/**
	 * Prints a warning message to the console.
	 * @param {...any} message - The message to print.
	 */
	static warn(...message) {
		this.printWithColor("yellow", ...message);
	}

	/**
	 * Prints a debug message to the console.
	 * @param {...any} message - The message to print.
	 */
	static debug(...message) {
		this.printWithColor("gray", ...message);
	}

	/**
	 * Prints a log message to the console.
	 * @param {...any} message - The message to print.
	 */
	static log(...message) {
		this.printWithColor("white", ...message);
	}
}

export async function printMessage(m, sock) {
	console.log(
		`${chalk.greenBright("[ MSG ]")}: ${chalk.bold(
			chalk.italic(m.pushName),
			chalk.bold(`- ${m.sender.replace(/[^0-9]/g, "")}`)
		)} (${chalk.blueBright(
			m.isGroup ? await (await sock.groupMetadata(m.chat)).subject : "Private Chat"
		)}): ${chalk.visible(m.text)}`
	);
}
