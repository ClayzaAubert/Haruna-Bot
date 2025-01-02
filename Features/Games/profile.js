import axios from "axios";
export default {
	command: ["profile", "pr"],
	description: "Show your profile information",
	category: "Games",
	owner: false,
	admin: false,
	hidden: false,
	limit: false,
	group: false,
	private: false,

	haruna: async function (m, { text, args, sock, api, feature, db }) {
		const user = db.users.get(m.sender);
		const premium = user.premium ? "Yes" : "No";

		// in usd
		const USDformatter = new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 2,
		});
		const balance = USDformatter.format(user.balance);
		const limit = user.limit;

		async function getCurrency() {
			const { data } = await axios.get(
				"https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json"
			);

			// change base on your currency
			const rate = data.usd.idr;
			const Currencyformatter = new Intl.NumberFormat("id-ID", {
				style: "currency",
				currency: "IDR",
				minimumFractionDigits: 2,
			});

			return Currencyformatter.format(user.balance * rate);
		}

		const profile = `Name: ${user.name}
Premium: ${premium}
Balance: ${balance} / ${await getCurrency()}
Limit: ${limit}`;

		return await m.reply(profile)
	},
	failed: "Failed to haruna the %cmd command\n%error",
	wait: null,
	done: null,
};