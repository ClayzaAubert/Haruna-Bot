import {
	makeWASocket,
	fetchLatestBaileysVersion,
	DisconnectReason,
	useMultiFileAuthState,
	makeCacheableSignalKeyStore,
} from "baileys";
import NodeCache from "node-cache";
import { logger } from "../Utils/Logger.js";
import { Config } from "../config.js";
import { Handler } from "./Handler.js";
import { Print } from "../Libs/Print.js";
import Pino from "pino";

const msgRetryCounterCache = new NodeCache();

async function connectToWhatsApp(use_pairing_code = Config.use_pairing_code) {
	const { state, saveCreds } = await useMultiFileAuthState("db/sessions");
	const { version } = await fetchLatestBaileysVersion();

	const sock = makeWASocket({
		version,
		printQRInTerminal: !use_pairing_code,
		mobile: false,
		logger: Pino({ level: "silent" }),
		auth: {
			creds: state.creds,
			keys: makeCacheableSignalKeyStore(state.keys, logger),
		},
		generateHighQualityLinkPreview: true,
		msgRetryCounterCache,
		...(use_pairing_code
			? { browser: ["Mac OS", "chrome", "121.0.6167.159"] }
			: {}),
		getMessage,
	});

	if (
		use_pairing_code &&
		Config.phone_number &&
		!sock.authState.creds.registered
	) {
		const phone_number = Config.phone_number.replace(/[^0-9]/g, "");
		Print.debug("Using Pairing Code To Connect: ", phone_number);
		await new Promise((resolve) => setTimeout(resolve, Config.pairing_wait));
		const code = await sock.requestPairingCode(phone_number, "HARUNA17");
		Print.success("Pairing Code:", code);
	}

	sock.ev.process(async (ev) => {
		if (ev["creds.update"]) {
			await saveCreds();
		}
		if (ev["connection.update"]) {
			console.log("Connection update", ev["connection.update"]);
			const update = ev["connection.update"];
			const { connection, lastDisconnect } = update;
			if (connection === "close") {
				const shouldReconnect =
					lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
				console.log(
					"connection closed due to ",
					lastDisconnect.error,
					", reconnecting ",
					shouldReconnect
				);
				if (shouldReconnect) {
					connectToWhatsApp();
				}
			} else if (connection === "open") {
				console.log("opened connection");
			}
		}
		if (ev["messages.upsert"]) {
			Handler(ev["messages.upsert"], sock);
		}
	});

	/**
	 * @param {import("baileys").WAMessageKey} key
	 * @returns {import("baileys").WAMessageContent | undefined}
	 */
	async function getMessage(key) {
		// Karena tidak ada store, return kosong ajah
		return undefined;
	}

	return sock;
}

export default connectToWhatsApp;
