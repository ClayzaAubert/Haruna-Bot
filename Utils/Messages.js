import {
	getContentType,
	jidNormalizedUser,
	downloadContentFromMessage,
	areJidsSameUser,
} from "baileys";
import fs from "fs/promises";

import Replace from "../Libs/Replaces.js";
import { mimeMap } from "../Libs/Medias.js";

// Handle sementara fungs send dengan LID
// === LID Resolver ===
const resolveLid = async (jid, sock) => {
	try {
		if (jid && jid.endsWith('@s.whatsapp.net')) {
			const lid = await sock.getLidUserId(jid);
			if (lid) return lid;
		}
	} catch (e) {
		console.warn(`Gagal resolve LID untuk ${jid}:`, e.message);
	}
	return jid;
};

// === Media Downloader ===
const downloadMedia = async (message, pathFile) => {
	const type = Object.keys(message)[0];
	try {
		const stream = await downloadContentFromMessage(message[type], mimeMap[type]);
		const buffer = [];
		for await (const chunk of stream) buffer.push(chunk);
		if (pathFile) {
			await fs.writeFile(pathFile, Buffer.concat(buffer));
			return pathFile;
		} else {
			return Buffer.concat(buffer);
		}
	} catch (e) {
		throw e;
	}
};

// === decodeJid & Phone Formatter ===
const decodeJid = (jid) => {
	if (!jid || typeof jid !== 'string') return jid || null;
	return jid?.decodeJid?.() || jidNormalizedUser(jid);
};

const formatPhoneNumber = (jid) => {
	try {
		const number = jid.replace('@s.whatsapp.net', '').replace('@g.us', '');
		return number ? '+' + number : 'Unknown';
	} catch {
		return 'Unknown';
	}
};

// === getName() ===
const getName = async (jid = '', withoutContact = false, sock, store) => {
	try {
		jid = decodeJid(jid);
		withoutContact = sock.withoutContact || withoutContact;
		let v;

		if (jid.endsWith('@g.us')) {
			try {
				v = await sock.groupMetadata?.(jid) || {};
				return v.name || v.subject || formatPhoneNumber(jid);
			} catch {
				return 'Unknown Group';
			}
		}

		if (jid.endsWith('@newsletter')) {
			try {
				if (store?.getContact) v = store.getContact(jid) || {};
				if (v.name || v.notify || v.verifiedName || v.vname)
					return v.name || v.notify || v.verifiedName || v.vname;

				const methods = [
					() => sock.newsletterMetadata?.(jid),
					() => sock.getNewsletterInfo?.(jid),
					() => sock.subscribeNewsletterUpdates?.(jid),
					() => sock.newsletterMetadataByJid?.(jid),
				];

				for (const m of methods) {
					try {
						const res = await m();
						if (res?.name || res?.subject) return res.name || res.subject;
					} catch {}
				}

				return `Newsletter ${jid.split('@')[0].slice(-6)}`;
			} catch {
				return 'Unknown Newsletter';
			}
		}

		if (jid === '0@s.whatsapp.net') return 'WhatsApp';
		if (areJidsSameUser(jid, sock.user?.id || '')) v = sock.user;
		else {
			v = store?.getContact?.(jid) || {};
			if (!v.name && sock.store?.contacts?.[jid])
				v = { ...v, ...sock.store.contacts[jid] };

			if (!v.name) {
				try {
					const [res] = await sock.onWhatsApp(jid.replace('@s.whatsapp.net', ''));
					if (res?.name) v.name = res.name;
					if (res?.notify) v.notify = res.notify;
				} catch {}
			}

			if (!v.name) {
				try {
					const status = await sock.fetchStatus(jid);
					if (status?.status) v.status = status.status;
				} catch {}
			}
		}

		return (
			(withoutContact ? '' : v.name) ||
			v.notify ||
			v.verifiedName ||
			v.vname ||
			v.subject ||
			v.status ||
			formatPhoneNumber(jid)
		);
	} catch {
		return 'Unknown';
	}
};

// === MAIN EXPORT ===
export function Messages(upsert, sock, store) {
	const { messages } = upsert;
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

		if (["viewOnceMessageV2", "documentWithCaptionMessage"].includes(m.mtype)) {
			m.message = m.message[m.mtype].message;
		}

		m.mtype = getContentType(m.message);
		m.contextInfo = m.message[m.mtype]?.contextInfo || {};
		m.mentionedJid = m.contextInfo?.mentionedJid || [];
		m.mentionMe = m.mentionedJid[0] === sock.user.id;

		const quoted = m.contextInfo.quotedMessage || null;
		if (quoted) {
			const qMsg = quoted.ephemeralMessage?.message || quoted;
			const type = Object.keys(qMsg)[0];
			const message = qMsg[type]?.message || qMsg[type] || qMsg;

			m.quoted = {
				participant: jidNormalizedUser(m.contextInfo.participant),
				message,
				sender: jidNormalizedUser(m.contextInfo.participant),
				mtype: getContentType(message),
				key: {
					id: m.contextInfo.stanzaId,
					fromMe: m.key.fromMe,
					remoteJid: m.chat,
					...(m.isGroup ? { participant: m.contextInfo.participant } : {}),
				},
				text:
					message?.conversation ||
					message?.text ||
					message?.description ||
					message?.caption ||
					message?.hydratedTemplate?.hydratedContentText ||
					"",
				react: async (emoji) =>
					sock.sendMessage(m.chat, {
						react: { text: String(emoji), key: m.quoted.key },
					}),
				delete: () =>
					sock.sendMessage(m.chat, { delete: m.quoted.key }),
				getName: (w = false) =>
					getName(m.quoted.sender, w, sock, store),
				download: (path) => downloadMedia(message, path),
				reactLid: async (emoji) => {
					const to = await resolveLid(m.chat, sock);
					return sock.sendMessage(to, {
						react: { text: String(emoji), key: m.quoted.key },
					});
				},
				deleteLid: async () => {
					const to = await resolveLid(m.chat, sock);
					return sock.sendMessage(to, { delete: m.quoted.key });
				},
			};
		}

		m.text =
			m.message[m.mtype]?.caption ||
			m.message[m.mtype]?.text ||
			m.message[m.mtype]?.conversation ||
			m.message?.conversation || "";

		m.react = (emoji) =>
			sock.sendMessage(m.chat, {
				react: { text: String(emoji), key: m.key },
			});
		m.reply = (text, font) =>
			sock.sendMessage(
				m.chat,
				{ text: (font && Replace(text, font)) || text },
				{ quoted: m }
			);
		m.replyLid = async (text, font) => {
			const to = await resolveLid(m.chat, sock);
			return sock.sendMessage(
				to,
				{ text: (font && Replace(text, font)) || text },
				{ quoted: m }
			);
		};
		m.replyUpdate = async (text, cb) => {
			const response = await sock.sendMessage(
				m.chat,
				{ text: String(text) },
				{ quoted: m }
			);
			if (typeof cb === "function") {
				cb(async (n_text) => {
					await sock.sendMessage(m.chat, {
						text: String(n_text),
						edit: response.key,
					});
				});
			}
		};

		m.delete = () => sock.sendMessage(m.chat, { delete: m.key });
		m.download = (pathFile) => downloadMedia(m.message, pathFile);
		m.getName = (withoutContact = false) =>
			getName(m.sender, withoutContact, sock, store);
	}

	sock.user.id = jidNormalizedUser(sock.user.id);

	// Patch sekali agar bisa digunakan global
	if (!sock.sendMessageLid) {
		sock.sendMessageLid = async (jid, msg, options = {}) => {
			const to = await resolveLid(jid, sock);
			return sock.sendMessage(to, msg, options);
		};
	}

	return m;
}
