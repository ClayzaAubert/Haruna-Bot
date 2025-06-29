export const Config = {
	phone_number: process.env.PHONE_NUMBER || "62xxxx", // Number BOT for pairing
	owners: process.env.OWNERS ? process.env.OWNERS.split(",") : ["62xxxx"], // Comma-separated list in ENV

	use_pairing_code: process.env.USE_PAIRING_CODE
		? process.env.USE_PAIRING_CODE.toLowerCase() === "true"
		: true,
	pairing_wait: process.env.PAIRING_WAIT
		? parseInt(process.env.PAIRING_WAIT)
		: 1000 * 6,

	prefix: process.env.PREFIX
		? process.env.PREFIX.split(",")
		: ["!", ".", "+"],

	maelyn_apikey: process.env.MAELYN_APIKEY || "", // https://maelyn.sbs
	bing_cookie: process.env.BING_COOKIE || "", // _U

	// change the timezone to your timezone
	timezone: process.env.TIMEZONE || "Asia/Jakarta",

	profile: {
		namebot: process.env.PROFILE_NAMEBOT || "Kurodate Haruna",
		powered: process.env.PROFILE_POWERED || "By Maelyn APIs",
		web: process.env.PROFILE_WEB || "https://maelyn.sbs",
	},

	images: {
		menu: process.env.IMAGES_MENU || "https://s6.imgcdn.dev/Yc8bUC.png",
		allmenu: process.env.IMAGES_ALLMENU || "https://s6.imgcdn.dev/Yc8bUC.png",
	},

	database: {
		use_mongo: process.env.DATABASE_USE_MONGO
			? process.env.DATABASE_USE_MONGO.toLowerCase() === "true"
			: false,
		mongo_url: process.env.DATABASE_MONGO_URL || "mongodb://localhost:27017/database",

		path: process.env.DATABASE_PATH || "./db/database.json",
		save_interval: process.env.DATABASE_SAVE_INTERVAL
			? parseInt(process.env.DATABASE_SAVE_INTERVAL)
			: 10_000,
		debug: process.env.DATABASE_DEBUG
			? process.env.DATABASE_DEBUG.toLowerCase() === "true"
			: false,
	},
};