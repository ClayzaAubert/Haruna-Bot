import "dotenv/config";

import { Config } from "./config.js";

import db from "./Libs/Database.js";
import connectToWhatsApp from "./Sockets/Connect.js";
import Feature from "./Libs/Feature.js";

await db.initialize();
db.saveDataPeriodically();

Feature.init();
connectToWhatsApp();

// TODO: move this to a separate file
// run cron jobs every 24 hours, reset user limit to 15
db.users.cron.schedule(
	"0 0 0 * * *",
	(users) => {
		for (const key in users) {
			const user = users[key];
			user.limit = 15;
		}
	},
	{ timezone: Config.timezone ?? "Asia/Jakarta" }
);