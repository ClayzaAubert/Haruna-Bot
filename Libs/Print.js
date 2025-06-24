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

/**
 * Print incoming WhatsApp message with style and channel/group/private support
 * @param {import("baileys").proto.IWebMessageInfo} m
 * @param {ReturnType<typeof import("baileys").makeWASocket>} sock
 */
export async function printMessage(m, sock) {
	const senderId = m.key?.participant || m.key?.remoteJid || "unknown@jid";
	let lidId = "unknown@lid";
if (senderId && senderId.endsWith("@s.whatsapp.net")) {
	try {
		lidId = await sock.getLidUserId(senderId);
	} catch (err) {
		console.error("Gagal ambil LID:", err.message);
	}
}
	const chatId = m.key?.remoteJid || "unknown@jid";

	const isGroup = chatId.endsWith("@g.us");
	const isChannel = chatId.endsWith("@newsletter");
	const isPrivate = !isGroup && !isChannel;

	const numberOnly = senderId.replace(/[^0-9]/g, "") || "-";
	const now = new Date();
	const timeStamp = `${now.toLocaleTimeString("id-ID", { hour12: false })} ${now.toLocaleDateString("id-ID")}`;

	// Get sender name & chat name
	let senderName = "Unknown";
	let chatName = "Private Chat";

	try {
		if (isChannel) {
			// For channels, get the channel name from chatId
			chatName = await m.getName(chatId) || "Channel";
			// For channel sender, use the channel name or original format
			senderName = chatName.replace("Channel ", "") || senderId.split('@')[0];
		} else {
			// Get sender name - gunakan m.pushName (property) atau m.getName()
			if (m.pushName && m.pushName.trim()) {
				senderName = m.pushName;
			} else {
				senderName = await m.getName(senderId) || `+${numberOnly}`;
			}

			if (isGroup) {
				// Get group name
				try {
					const groupMetadata = await sock.groupMetadata(chatId);
					chatName = groupMetadata.subject || "Group";
				} catch (error) {
					chatName = await m.getName(chatId) || "Group";
				}
			} else {
				chatName = "Private Chat";
			}
		}
	} catch (error) {
		console.log('Error getting names:', error.message);
		if (isChannel) {
			senderName = "Channel";
			chatName = "Channel";
		} else {
			// Fallback ke pushName atau number
			senderName = m.pushName || `+${numberOnly}`;
			chatName = isGroup ? "Group" : "Private Chat";
		}
	}

	// Debug logging
// console.log(JSON.stringify({
// 	debug: true,
// 	senderId,
// 	lidId,
// 	chatId,
// 	isChannel,
// 	isGroup,
// 	pushName: m.pushName,
// 	senderName,
// 	chatName
// }, null, 2));

	// Get message type and content
	const msg = m.message || {};
	const messageType = Object.keys(msg)[0] || "unknown";

	let content = "";
	let label = "";

	// Debug message structure
// 	console.log(`Message structure debug:
// - messageType: ${messageType}
// - m.text: ${m.text}
// - m.mtype: ${m.mtype}
// - msg keys: ${Object.keys(msg).join(', ')}`);

	// Use m.text if available (from Messages function processing)
	if (m.text && m.text.trim()) {
		content = m.text;
	}

	switch (messageType) {
		case "conversation":
			content = content || msg.conversation || "";
			label = "TEXT";
			break;

		case "extendedTextMessage":
			content = content || msg.extendedTextMessage?.text || "";
			label = "TEXT";
			break;

		case "imageMessage":
			content = content || msg.imageMessage?.caption || "";
			label = "IMAGE";
			break;

		case "videoMessage":
			content = content || msg.videoMessage?.caption || "";
			label = "VIDEO";
			break;

		case "documentMessage":
			const fileName = msg.documentMessage?.fileName || "Unnamed";
			content = content || msg.documentMessage?.caption || "";
			label = `DOCUMENT (${fileName})`;
			break;

		case "audioMessage":
			label = msg.audioMessage?.ptt ? "PTT" : "AUDIO";
			break;

		case "stickerMessage":
			label = "STICKER";
			break;

		case "contactMessage":
			label = "CONTACT";
			break;

		case "locationMessage":
			label = "LOCATION";
			break;

		case "reactionMessage":
			const reaction = msg.reactionMessage?.text || "👍";
			content = `Reacted with ${reaction}`;
			label = "REACTION";
			break;

		case "protocolMessage":
			label = "PROTOCOL";
			content = "Message deleted or protocol update";
			break;

		case "ephemeralMessage":
			// Handle ephemeral messages
			const ephemeralMsg = msg.ephemeralMessage?.message;
			if (ephemeralMsg) {
				const ephemeralType = Object.keys(ephemeralMsg)[0];
				content = ephemeralMsg.conversation || 
						 ephemeralMsg[ephemeralType]?.text || 
						 ephemeralMsg[ephemeralType]?.caption || "";
				label = "EPHEMERAL";
			}
			break;

		default:
			// Fallback: try to extract text from any message type
			if (!content && msg[messageType]) {
				content = msg[messageType].text || 
						 msg[messageType].caption || 
						 msg[messageType].conversation || "";
			}
			
			// If still no content but m.text exists, use it
			if (!content && m.text) {
				content = m.text;
				label = "TEXT";
			} else {
				label = messageType.toUpperCase() || "UNKNOWN";
			}
			break;
	}

	// Styling
	const bubble = chalk.bgHex("#6C5CE7").white.bold(` ${label} `);
	const line = chalk.hex("#6C5CE7");

	const header = `${line("╭────────────────────────────────────────────")}`;
	const title = `${line("│")} ${chalk.bold(senderName)} ${chalk.gray("-")} ${chalk.cyanBright(numberOnly)} ${chalk.gray("(" + chatName + ")")}`;
	const time = `${line("│")} ${chalk.gray("🕒")} ${chalk.white(timeStamp)}`;
	const messageLine = `${line("│")} ${chalk.whiteBright(content || chalk.gray("[no caption]"))}`;
	const footer = `${line("╰────────────────────────────────────────────")}`;

	Print._log(`${bubble}\n${header}\n${title}\n${time}\n${messageLine}\n${footer}`);
}