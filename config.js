export const Config = {
	phone_number: "62xxxx", // Number BOT for pairing
	owners: ["62xxxx"], // Number Owner for specific feature access

	use_pairing_code: true,
	pairing_wait: 1000 * 6,

	prefix: ["!", ".", "+"],

	maelyn_apikey: process.env.MAELYN_APIKEY || "", // https://maelyn.sbs
	bing_cookie: process.env.BING_COOKIE || "", // _U

	// change the timezone to your timezone
	timezone: "Asia/Jakarta",

	profile: {
		namebot: "Kurodate Haruna",
		powered: "By Maelyn APIs",
		web: "https://maelyn.tech",
	},

	images: {
		menu: "https://s6.imgcdn.dev/Yc8bUC.png",
		allmenu: "https://s6.imgcdn.dev/Yc8bUC.png",
	},

	database: {
		use_mongo: false,
		mongo_url: "mongodb://localhost:27017/database",

		path: "./db/database.json",
		save_interval: 10_000,
		debug: false,
	},
};