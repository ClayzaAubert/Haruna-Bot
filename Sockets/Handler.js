import { performance } from "perf_hooks";
import Feature from "../Libs/Feature.js";
import Queue from "../Libs/Queue.js";
import { Messages } from "../Utils/Messages.js";
import { Prefix } from "../Utils/Prefix.js";
import { Config } from "../config.js";
import { printMessage } from "../Libs/Print.js";
import Maelyn from "maelyn.js"

const api = new Maelyn(Config.maelyn_apikey);
import db from "../Libs/Database.js";

/**
 * @typedef miscOptions - The misc options
 * @property {string[]} args - The arguments
 * @property {import("baileys").WASocket} sock - The socket connection
 * @property {import("baileys").WASocket} conn - The socket connection (alias)
 * @property {{get: import("../Utils/ApiRequest.js").get, post: import("../Utils/ApiRequest.js").post, request: import("../Utils/ApiRequest.js").request}} api - The api request
 * @property {import("baileys").GroupMetadata}
 * @property {boolean} isOwner - If the user is the owner
 * @property {boolean} isAdmin - If the user is the admin
 * @property {string} command - The command
 * @property {string} text - The text
 * @property {string} usedPrefix - The used prefix
 * @property {import("../Libs/Database.js").default} db - The database
 * @property {typeof Feature.plugins} feature - The feature
 * @property {ReturnType<import("../Utils/Store.js").Store>} store - The store
 */

/**
 * Handles incoming messages
 * @param {import("baileys").BaileysEventMap["messages.upsert"]} upsert - The upsert event
 * @param {import("baileys").WASocket} sock - The socket connection
 * @param {ReturnType<import("../Utils/Store.js").Store>} store - The store
 */
export async function Handler(upsert, sock, store) {
	if (upsert.type !== "notify") {
		return;
	}

	const message = Messages(upsert, sock);
	if (!message || message.sender === "status@broadcast") {
		return;
	}
	const BOT_SETTINGS = db.settings.set(sock.user.id);

	const [command, text, usedPrefix] = Prefix(message.text);
	const args = text?.split(" ").map((x) => x.trim()) || [];

	const groupMetadata = message.isGroup
		? await sock.groupMetadata(message.chat)
		: {};
	const isOwner = Config.owners
		.map((x) => x.replace(/[^0-9]/g, "") + "@s.whatsapp.net")
		.includes(message.sender);
	const isAdmin = message.isGroup
		? groupMetadata.participants
				.filter((participant) => participant.admin)
				.map((participant) => participant.id)
				.includes(message.sender)
		: false;
	const isBotAdmin = message.isGroup
		? groupMetadata.participants
				.filter((participant) => participant.admin)
				.map((participant) => participant.id)
				.includes(sock.user.id)
		: false;
	const feature = Feature;
	if (!feature.isInit) {
		feature.init();
	}
	if (BOT_SETTINGS.self && !isOwner) {
		return;
	}

	if (message.isGroup) {
		const group = db.groups.set(message.chat);
		group.name = groupMetadata.subject;
	}

	const user = db.users.set(message.sender);
	if (user.banned && !isOwner) {
		return;
	}

	// something seems wrong here
	if (user.premium && user.premium_expired < Date.now()) {
		user.premium = false;
		user.premium_expired = 0;
	}

	user.name = message.pushName;
	let executed_plugin = null;
	try {
		for (const name in feature.plugins) {
			const plugin = feature.plugins[name];

			// let's keep it like this for now
			const miscOptions = {
				args,
				sock,
				conn: sock,
				api,
				groupMetadata,
				isOwner,
				isAdmin,
				isBotAdmin,
				command,
				text,
				usedPrefix,
				db,
				feature: feature.plugins,
				store,
			};
			if (plugin.before && typeof plugin.before === "function") {
				try {
					await plugin.before(message, miscOptions);
				} catch (error) {
					console.error(error);
				}
			}

			const isCustomPrefix = plugin?.customPrefix
				? plugin.customPrefix
					.map((prefix) => prefix.toLowerCase())
					.includes(message.text.split(" ")[0].toLowerCase())
				: false;

			if (isCustomPrefix) {
				const args = message.text.split(" ");
				args.shift(); // Menghapus prefix dari args
				miscOptions.text = args.join(" ");
				miscOptions.command = args[0]; // Opsional: Tetapkan command jika diperlukan
			}

			const canExecuteCommand =
				isCustomPrefix ||
				plugin?.command?.map((s) => s.toLowerCase()).includes(command);

			if (canExecuteCommand) {
				if (Queue.exist(message.sender, plugin)) {
					message.reply("You are still using this command");
					continue;
				}
				if (plugin.owner && !isOwner) {
					message.reply("Only the owner can use this command.");
					continue;
				}
				if (plugin.admin && message.isGroup && !isAdmin) {
					message.reply("Only the admin can use this command.");
					continue;
				}
				if (plugin.group && !message.isGroup) {
					message.reply("This command only available in group");
					continue;
				}
				if (plugin.private && message.isGroup) {
					message.reply("This commnad only available in private chat");
					continue;
				}

				if (plugin.limit && !isOwner && !user.premium) {
					if (user.limit < 0) {
						message.reply("You have reached the limit of using this command");
						continue;
					}
					plugin.callback = () => {
						user.limit--;
					};
				}

				executed_plugin = plugin;
				Queue.add(message.sender, executed_plugin);

				try {
					// this is useless, but as you want
					// if (plugin.wait) {
					// 	const waitMessage = Array.isArray(plugin.wait)
					// 		? plugin.wait[Math.floor(Math.random() * plugin.wait.length)]
					// 		: plugin.wait;

					// 	await sock.sendMessage(
					// 		message.chat,
					// 		{
					// 			text: waitMessage
					// 				.replace("%name", message.pushName)
					// 				.replace("%tag", "@" + message.sender.replace(/[^0-9]/g, ""))
					// 				.replace("%group", message.isGroup ? groupMetadata.subject : ""),
					// 			mentions: [message.sender],
					// 		},
					// 		{ quoted: message }
					// 	);
					// }
					// const old = performance.now();

					await plugin.haruna(message, miscOptions);

					// this is useless, but as you want
					// if (plugin.done) {
					// 	const doneMessage = Array.isArray(plugin.done)
					// 		? plugin.done[Math.floor(Math.random() * plugin.done.length)]
					// 		: plugin.done;
					// 	await sock.sendMessage(
					// 		message.chat,
					// 		{
					// 			text: doneMessage
					// 				.replace("%name", message.pushName)
					// 				.replace("%tag", "@" + message.sender.replace(/^[0-9]/g, ""))
					// 				.replace("%group", message.isGroup ? groupMetadata.subject : "")
					// 				.replace("%exec", `${(performance.now() - old).toFixed(5)} ms`),
					// 			mentions: [message.sender],
					// 		},
					// 		{ quoted: message }
					// 	);
					// }
				} catch (error) {
					console.error(error, plugin);
					if (plugin.failed && typeof plugin.failed === "string") {
						message.reply(
							plugin.failed.replace("%cmd", command).replace("%error", String(error))
						);
					}
				}
			}

			if (plugin.after && typeof plugin.after === "function") {
				try {
					await plugin.after(message, miscOptions);
				} catch (error) {
					console.error(error);
				}
			}
		}
	} catch (error) {
		console.error(error);
	}
	Queue.remove(message.sender, executed_plugin);
	printMessage(message, sock);
}
