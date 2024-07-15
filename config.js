export const Config = {
	phone_number: "62xxx",
	owners: ["62xxx"],

	use_pairing_code: true,
	pairing_wait: 1000 * 6,

	prefix: ["!", ".", "+"],

	maelyn_apikey: process.env.MAELYN_APIKEY || "", // https://api.maelyn.tech
	bing_cookie: process.env.BING_COOKIE || "",

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
