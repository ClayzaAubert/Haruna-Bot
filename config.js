export const Config = {
	phone_number: "XXX", // Number BOT for pairing
	owners: ["XXX"], // Number Owner for specific feature access

	use_pairing_code: true,
	pairing_wait: 1000 * 6,

	prefix: ["!", ".", "+"],

	maelyn_apikey: process.env.MAELYN_APIKEY || "", // https://maelyn.tech
	bing_cookie: process.env.BING_COOKIE || "", // _U

	// change the timezone to your timezone
	timezone: "Asia/Jakarta",

	profile: {
		namebot: "Kurodate Haruna",
		powered: "By Maelyn APIs",
		web: "https://maelyn.tech",
	},

	images: {
		menu: "https://telegra.ph/file/f40d32d686760637e49c4.jpg",
		allmenu: "https://telegra.ph/file/460a444e140f5a5948532.jpg",
	},

	database: {
		use_mongo: false,
		mongo_url: "mongodb://localhost:27017/database",

		path: "./db/database.json",
		save_interval: 10_000,
		debug: false,
	},
};