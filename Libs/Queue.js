// File://home/rose/BOT/SuryaRB/Libs/Queue.js
class User {
	constructor() {
		this.list = {};
	}
}
class Queue {
	constructor() {
		this.queue = new User();
	}
	add(jid, plugin) {
		if (!this.queue.list[jid]) {
			this.queue.list[jid] = [];
		}
		this.queue.list[jid].push(plugin);
	}
	exist(jid, plugin) {
		if (!this.queue.list[jid]) {
			return false;
		}
		return this.queue.list[jid].includes(plugin);
	}
	remove(jid, plugin) {
		if (!this.queue.list[jid]) {
			return;
		}
		this.queue.list[jid].splice(this.queue.list[jid].indexOf(plugin), 1);
	}
	get list() {
		return this.queue.list;
	}
}
export default new Queue();
