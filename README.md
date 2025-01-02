<div align="center">
    <h1>
	    <i>Kurodate Haruna</i> </br> Whatsapp Bot
    </h1>
    <h3>
        ___________________________</br>
        Powered By Maelyn API
    </h3>
    <img height="auto" src="https://telegra.ph/file/460a444e140f5a5948532.jpg" alt="Kurodate Haruna MD"/>
</div>

**Haruna-Bot** adalah WhatsApp bot yang telah saya modifikasi dari kode asli [SuryaRB](https://github.com/xct007/SuryaRB), dengan tujuan untuk sepenuhnya mengintegrasikan seluruh fitur yang ditawarkan oleh [Maelyn APIs](https://maelyn.tech). Saya melakukan penyesuaian kode untuk memastikan bahwa bot ini tidak hanya memenuhi kebutuhan saya saat ini, tetapi juga dapat memberikan pengalaman yang lebih baik dan lebih responsif bagi pengguna lainnya.

# Maelyn Group Service
- Maelyn Group : [maelyn.my.id](https://maelyn.my.id/)
- Maelyn API : [maelyn.tech](https://maelyn.tech/)
- Maelyn CDN : [cdn.maelyn.tech](https://cdn.maelyn.tech/)

# Table of Contents
- [Table of Contents](#table-of-contents)
  - [Requirements](#requirements)
  - [Installation](#installation)
  - [Creating features/plugins](#creating-featuresplugins)
  - [License](#license)
  - [Contributors](#contributors)

## Requirements

- [Node.js](https://nodejs.org/en/download/) v20 or higher
- [Git](https://git-scm.com/downloads)
- [NPM](https://www.npmjs.com/get-npm) or [Yarn](https://yarnpkg.com/getting-started/install)
- [FFmpeg](https://ffmpeg.org/download.html) **(required for Sticker and Audio features)**

## Installation
1. **Install Nodejs**
   ```sh
   apt install nodejs
   ```
2. **Install Git**
   ```sh
   apt install git
   ```
3. **Install NVM (Node Version Manager)**
   ```sh
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
   ```
4. **Load NVM Script**
   ```sh
   source ~/.nvm/nvm.sh
   ```
5. **Install Node.js v20**
   ```sh
   nvm install 20
   ```
6. **Set Node.js v20 as Default**
   ```sh
   nvm use 20
   ```
7. **Clone the repository**
   ```sh
   git clone https://github.com/ClayzaAubert/Haruna-Bot.git
   ```
8. **Install the dependencies**
   ```sh
   npm install
   ```
9. **Create or rename the .env.example file to .env**
   ```sh
   MAELYN_APIKEY=PASTE_YOUR_APIKEY_HERE
   ```
   Get your API key from [API Dashboard](https://api.maelyn.tech)
10. **Edit the config.js file**

   ```javascript
   export const Config = {
   	// The bot's phone number
   	// required if use pairing code
   	phone_number: "62xxxx",

   	// Owner's phone number
   	owners: ["62xxx"],

   	// use pairing or not
   	use_pairing_code: true,

   	// Wait time for requesting pairing (in milliseconds)
   	pairing_wait: 1000 * 6,

   	// prefix for commands
   	prefix: ["!", "."],

   	// use .env file for API key & Bing Cookie
   	maelyn_apikey: process.env.MAELYN_APIKEY,
   	bing_cookie: process.env.BING_COOKIE,
   	
   	// for menu list thumbnails
   	profile: {
   	    namebot: "Kurodate Haruna",
   	    powered: "By Maelyn APIs",
   	    web: "https://maelyn.tech",
   	},
   	
   	images: {
   	    menu: "https://telegra.ph/file/f40d32d686760637e49c4.jpg",
   	    allmenu: "https://telegra.ph/file/460a444e140f5a5948532.jpg",
   	},

   	// timezone
   	timezone: "Asia/Jakarta",

   	// Database settings
   	database: {
   		// use mongo or not
   		use_mongo: true,
   		mongo_url: "mongodb://localhost:27017/database",

   		// Path to the database file
   		path: "./database.json",

   		// Save interval (in milliseconds)
   		save_interval: 10_000,

   		// show database save logs
   		debug: false,
   	},
   };
   ```

11. **Run the application:**

   `node index.js` / `npm start` / `yarn start`

   or using [pm2](https://pm2.keymetrics.io/docs/usage/quick-start/):

   ```sh
   pm2 start index.js --name "HarunaBot"
   pm2 logs HarunaBot
   ```

## Creating features/plugins

Create new file in `Features` folder with the following template

```javascript
export default {
	// Command to trigger the execution
	// Can be an array of strings to have multiple triggers
	command: ["command", "command2"],
	// Description of the command, displayed in the menu
	description: "The description of the command",
	// Category as header in the menu
	category: "My Category",

	// If true, only the owner listed in config.js can call the command
	owner: false,
	// Only admin in the group can call the command
	admin: false,
	// If hidden, the command will not be shown in the menu
	hidden: false,
	// If true, user limit will be checked before executing the command
	// If the limit is reached, the command will not be executed
	limit: false,

	// If true the command only can be call in group chat
	group: false,
	// If true the command only can be call in private chat
	private: false,

	/**
	 * Handler function to execute the command
	 * @param {import("../../Utils/Messages").ExtendedWAMessage} m - The message object.
	 * @param {import("../Handler").miscOptions} options - The options.
	 */
	execute: async function (
		m,
		{
			args,
			sock,
			conn,
			api,
			groupMetadata,
			isOwner,
			isAdmin,
			command,
			text,
			usedPrefix,
			db,
		}
	) {
		// Single reply
		m.reply("Hello World");

		// Single reply with fancy text
		// 2nd parameter is the style of the text listed in Config/Fonts.js
		m.reply("Hello World", "funky");

		// Reply then update message
		m.replyUpdate("previous message", async (update) => {
			// do something
			//...
			// update the message
			update("new message");
		});

		// react to the message
		m.react("👍");

		// delete the message (if the bot has the permission to do so)
		m.delete();

		// Download media (image, video, audio)
		const media = m?.download?.().catch(() => null);
		if (media) {
			// Do something with the media buffer
		}

		// Make a request to the ITSROSE API (Axios instance)
		// api.get() and api.post() are the same as axios.get() and axios.post()
		// 1st parameter is the path to the endpoint (without the base URL)
		// 2nd parameter is the request body or query parameters (optional)
		// See Utils/ApiRequest.js for more information
		const response = await api.get("/path/to/endpoint", { param: "value" });
		if (response.data.status) {
			// Do something with the response
			const data = response.data;
			m.reply(data);
		}
	},

	// Message to display when the command execution fails
	// %cmd alias for the command, %error alias for the error
	failed: "Failed to haruna the %cmd command\n\n%error",

	// Message to display while waiting for the command to finish (useless for now)
	// aliase:
	// %name = user pushName
	// %tag = tag the user
	// %group = group subject/name
	wait: null, // null | string | string[] | any
	// wait: ["Please wait %tag", "Hold on %tag, fetching response"], // random if array

	// Message to display when the command execution is done (useless for now)
	// aliase:
	// %name = user pushName
	// %tag = tag the user
	// %group = group subject/name
	// %exec = speed the execution time "12.345 ms"
	done: null, // null | string | string[] | any
	// done: "Success %exec" // random if array
};
```

## License

This project is licensed under the [MIT License](LICENSE).

## Contributors

<a href="https://github.com/xct007">
  <img src="https://avatars.githubusercontent.com/xct007?v=4&s=64" width="64" height="64" style="border-radius: 50%; border: 2px solid #ffffff;">
</a>

<a href="https://github.com/nat9h">
  <img src="https://avatars.githubusercontent.com/nat9h?v=4&s=64" width="64" height="64" style="border-radius: 50%; border: 2px solid #ffffff;">
</a>

<a href="https://github.com/ClayzaAubert">
  <img src="https://avatars.githubusercontent.com/ClayzaAubert?v=4&s=64" width="64" height="64" style="border-radius: 50%; border: 2px solid #ffffff;">
</a>

