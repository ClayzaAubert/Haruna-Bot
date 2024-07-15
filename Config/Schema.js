export const UserSchema = {
	name: String,
	limit: Number,
	premium: Boolean,
	premium_expired: Number,
	emails: Array,
	banned: Boolean,
	balance: Number,
	games: Object,
	autolevelup: Boolean
};

export const GroupSchema = {
	name: String,
	banned: Boolean,
};

export const SettingsSchema = {
	self: Boolean,
};

export const Feature = {
	command: Array,
	description: String,
	category: String,
	owner: Boolean,
	admin: Boolean,
	hidden: Boolean,
	limit: Boolean,
	group: Boolean,
	private: Boolean,
	haruna: Function,
	failed: String,
	wait: String,
	done: String,
};
