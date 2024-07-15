import {
	getContentType,
	jidNormalizedUser,
	downloadContentFromMessage,
} from "baileys";
import fs from "fs/promises";

import Replace from "../Libs/Replaces.js";
import { mimeMap } from "../Libs/Medias.js";

const downloadMedia = async (message, pathFile) => {
	const type = Object.keys(message)[0];
	try {
		const stream = await downloadContentFromMessage(message[type], mimeMap[type]);
		const buffer = [];
		for await (const chunk of stream) {
			buffer.push(chunk);
		}
		if (pathFile) {
			await fs.promises.writeFile(pathFile, Buffer.concat(buffer));
			return pathFile;
		} else {
			return Buffer.concat(buffer);
		}
	} catch (e) {
		throw e;
	}
};

export function Messages(upsert, sock) {
	const { messages } = upsert;
	/** @type {import("baileys").WAMessage & ExtendedWAMessage} */
	const m = messages[0];
	if (m.key) {
		const { id, remoteJid } = m.key;
		m.id = id;
		m.isGroup = remoteJid.endsWith("@g.us");
		m.chat = jidNormalizedUser(remoteJid);
		m.sender = jidNormalizedUser(
			m.isGroup ? m.key.participant : m.key.fromMe ? sock.user.id : remoteJid
		);
	}

	if (m.message) {
		m.mtype = getContentType(m.message);

		if (m.mtype === "ephemeralMessage") {
			m.message = m.message[m.mtype].message;
			m.mtype = getContentType(m.message);
		}

		if (
			m.mtype === "viewOnceMessageV2" ||
			m.mtype === "documentWithCaptionMessage"
		) {
			m.message = m.message[m.mtype].message;
		}

		m.mtype = getContentType(m.message);

		try {
			m.contextInfo = m.message[m.mtype]?.contextInfo || {};
			m.mentionedJid = m.contextInfo?.mentionedJid || [];
			m.mentionMe = m.mentionedJid[0] === sock.user.id;
			const quoted = m.contextInfo.quotedMessage || null;
			if (quoted) {
				if (quoted.ephemeralMessage) {
					const type = Object.keys(quoted.ephemeralMessage.message)[0];
					const message =
						type === "documentMessage"
							? quoted.ephemeralMessage.message.documentMessage
							: quoted.ephemeralMessage.message[type]?.message;

					m.quoted = {
						participant: jidNormalizedUser(m.contextInfo.participant),
						message: message || quoted.ephemeralMessage.message,
					};
				} else {
					const type = Object.keys(quoted)[0];
					const message = quoted[type]?.message;

					m.quoted = {
						participant: jidNormalizedUser(m.contextInfo.participant),
						message: message || quoted,
					};
				}
				m.quoted.sender = m.quoted.participant;
				m.quoted.mtype = Object.keys(m.quoted.message)[0];
				m.quoted.mentionedJid =
					m.quoted.message[m.quoted.mtype].contextInfo?.mentionedJid || [];

				m.quoted.text =
					m.quoted.message?.conversation ||
					m.quoted.message[m.quoted.mtype]?.text ||
					m.quoted.message[m.quoted.mtype]?.description ||
					m.quoted.message[m.quoted.mtype]?.caption ||
					m.quoted.message[m.quoted.mtype]?.hydratedTemplate?.hydratedContentText ||
					"";
				m.quoted.key = {
					id: m.contextInfo.stanzaId,
					fromMe: m.quoted.sender === jidNormalizedUser(sock.user.id),
					remoteJid: m.chat,
					...(m.isGroup ? { participant: m.contextInfo.participant } : {}),
				};
				m.quoted.mtype =
					m.quoted.message[m.quoted.mtype]?.mimetype || getContentType(m.quoted.message);
				m.quoted.react = (emoji) =>
					sock.sendMessage(m.chat, {
						react: {
							text: String(emoji),
							key: m.quoted.key,
						},
					});
				m.quoted.delete = () => sock.sendMessage(m.chat, { delete: m.quoted.key });
				m.quoted.download = (pathFile) => downloadMedia(m.quoted.message, pathFile);
			} else {
				m.quoted = null;
			}

			m.text =
				m.message[m.mtype]?.caption ||
				m.message[m.mtype]?.text ||
				m.message[m.mtype]?.conversation ||
				m.message?.conversation ||
				"";

			m.mtype = m.message[m.mtype]?.mimetype || getContentType(m.message);
			m.react = (emoji) =>
				sock.sendMessage(m.chat, {
					react: {
						text: String(emoji),
						key: m.key,
					},
				});
			m.reply = (text, font) =>
				sock.sendMessage(
					m.chat,
					{
						text: (font && Replace(text, font)) || text,
					},
					{ quoted: m }
				);
			m.replyUpdate = async (text, cb) => {
				const response = await sock.sendMessage(
					m.chat,
					{ text: String(text) },
					{ quoted: m }
				);
				if (typeof cb === "function") {
					cb(async (n_text) => {
						await sock.sendMessage(m.chat, { text: String(n_text), edit: response.key });
					});
				}
			};

			m.delete = () => sock.sendMessage(m.chat, { delete: m.key });
			m.download = (pathFile) => downloadMedia(m.message, pathFile);
		} catch (error) {
			console.error(error);
		}
	}
	sock.user.id = jidNormalizedUser(sock.user.id);
	return m;
}
