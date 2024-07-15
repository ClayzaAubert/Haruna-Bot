import { readFileSync, writeFileSync, existsSync } from "fs";
import { Mutex } from "async-mutex";
import mongoose from "mongoose";
import cron from "node-cron";
import { Config } from "../config.js";
import { UserSchema, GroupSchema, SettingsSchema } from "../Config/Schema.js";

class Crons {
	/**
	 * @param {string} name - The object name.
	 * @param {object} data - The data object.
	 * @param {object} schema - The schema object.
	 */
	constructor(name, data, schema) {
		this.name = name;
		this[name] = data ?? {};
		this.schema = schema;
	}

	/**
	 * Validates a cron expression.
	 * @param {string} expression - The cron expression.
	 * @returns {boolean} True if the cron expression is valid, false otherwise.
	 */
	validate(expression) {
		return cron.validate(expression);
	}

	/**
	 * Schedules a cron job.
	 * @param {string} expression - The cron expression.
	 * @param {Function} fun - The function to haruna.
	 * @param {import("node-cron").ScheduleOptions} options - The cron job options (optional
	 * @returns {void}
	 * @throws {Error} If the cron expression is invalid.
	 */
	schedule(expression, fun, options) {
		if (!cron.validate(expression)) {
			throw new Error("Invalid cron expression");
		}
		cron.schedule(
			expression,
			async () => {
				fun(this[this.name]);
			},
			options
		);
	}

	/**
	 * Retrieves all the scheduled tasks.
	 * @returns {import("node-cron").ScheduledTask[]} All the scheduled tasks.
	 */
	getTasks() {
		return cron.getTasks();
	}
}
class Helper {
	/**
	 * @param {string} name - The object name.
	 * @param {object} data - The data object.
	 * @param {object} schema - The schema object.
	 */
	constructor(name, data, schema) {
		this.name = name;
		this[name] = data ?? {};
		this.schema = schema;

		this.cron = new Crons(name, this[name], this.schema);
	}
	/**
	 * Retrieves the value associated with the specified key from the database.
	 * If the key doesn't exist, it creates a new object for the key from the schema.
	 * @param {string} key - The key to retrieve the value for.
	 * @returns {UserSchema | GroupSchema | SettingsSchema | null} The value associated with the key.
	 */
	get(key) {
		return this[this.name][key] ?? null;
	}

	/**
	 * Sets the value for the specified key in the database.
	 * If the key already exists, it returns the existing value.
	 * @param {string} key - The key to set the value for.
	 * @returns {UserSchema | GroupSchema} The value associated with the key.
	 */
	set(key) {
		if (this[this.name][key]) {
			return this[this.name][key];
		}
		this[this.name][key] = {};
		for (const k in this.schema) {
			this[this.name][key][k] =
				typeof this.schema[k] === "function" ? this.schema[k]() : this.schema[k];
		}
		return this[this.name][key];
	}

	/**
	 * Checks if the specified key exists in the database.
	 * @param {string} key - The key to check.
	 * @returns {boolean} True if the key exists, false otherwise.
	 */
	isExist(key) {
		return this[this.name][key] ? true : false;
	}

	/**
	 * Deletes the specified key and its associated value from the database.
	 * @param {string} key - The key to delete.
	 * @returns {void}
	 */
	delete(key) {
		delete this[this.name][key];
	}

	/**
	 * Retrieves all the data stored in the database.
	 * @returns {{[key: string]: UserSchema | GroupSchema}} All the data stored in the database.
	 */
	all() {
		return this[this.name];
	}

	/**
	 * Clears all the data stored in the database.
	 * @returns {void}
	 */
	clear() {
		this[this.name] = {};
	}
}

/**
 * @class
 * Database class
 * @classdesc Represents a database for storing data.
 */
class Database {
	/**
	 * @private
	 * @type {boolean}
	 */
	#initialized = false;

	/**
	 * @private
	 * @type {string}
	 */
	#path = Config?.database?.path ?? "./database.json";

	/**
	 * @private
	 * @type {Object}
	 */
	#data = {
		users: {},
		groups: {},
		settings: {},
	};

	/**
	 * @private
	 * @type {Mutex}
	 */
	#mutex = new Mutex();

	/**
	 * Creates an instance of the Database class.
	 * @constructor
	 * @returns {Database} An instance of the Database class.
	 */
	constructor() {
		this._model = null;
		// this.initialize();
		// setInterval(() => {
		// 	this.#write();
		// }, Config?.database?.save_interval ?? 10_000);
	}

	/**
	 * Writes the database data to the JSON file.
	 * @private
	 * @returns {void}
	 */
	#write() {
		this.#mutex.runExclusive(async () => {
			Config?.database?.debug && console.debug("Saving database...");
			try {
				if (Config?.database?.use_mongo) {
					if (this._model) {
						await this._model.updateOne({}, this.#data, { upsert: true });
					}
				}
				writeFileSync(this.#path, JSON.stringify(this.#data, null, 2));
			} catch (e) {
				console.error(e);
			} finally {
				this.#mutex.release();
			}
		});
	}

	/**
	 * Initializes the database.
	 * @returns {Promise<void>}
	 */
	async initialize() {
		if (this.#initialized) {
			return;
		}
		if (Config?.database?.use_mongo) {
			await this.initializeMongoDB();
		}
		if (!existsSync(this.#path) || !this.isValidJsonFile()) {
			await this.createJsonFile();
		}
		this.#data = JSON.parse(readFileSync(this.#path, "utf-8"));
		this.#data.users = this.#data.users ?? {};
		this.#data.groups = this.#data.groups ?? {};
		this.#data.settings = this.#data.settings ?? {};

		this.users = new Helper("users", this.#data.users, UserSchema);
		this.groups = new Helper("group", this.#data.groups, GroupSchema);
		this.settings = new Helper("settings", this.#data.settings, SettingsSchema);

		this.#initialized = true;
	}

	/**
	 * Initializes the MongoDB database.
	 * @private
	 * @returns {Promise<void>}
	 * @throws {Error} If an error occurs while initializing the MongoDB database.
	 */
	async initializeMongoDB() {
		try {
			await mongoose.connect(Config.database.mongo_url, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
			});
			const DataSchema = new mongoose.Schema({
				users: Object,
				groups: Object,
				settings: Object,
			});

			this._model = mongoose.model("data", DataSchema);
		} catch (e) {
			throw new Error(e);
		}
	}

	/**
	 * Checks if the JSON file is valid.
	 * @returns {boolean} True if the JSON file is valid, false otherwise.
	 */
	isValidJsonFile() {
		const content = readFileSync(this.#path, "utf-8");
		try {
			JSON.parse(content);
			return true;
		} catch (e) {
			return false;
		}
	}

	/**
	 * Creates an empty JSON file.
	 * @private
	 * @returns {Promise<void>}
	 */
	async createJsonFile() {
		if (Config?.database?.use_mongo && this._model) {
			const data = await this._model.findOne();
			if (data) {
				writeFileSync(this.#path, JSON.stringify(data, null, 2));
				return;
			}
		}
		writeFileSync(this.#path, JSON.stringify({}));
	}

	/**
	 * Saves the data periodically.
	 * @param {number} interval - The interval to save the data.
	 * @returns {void}
	 */
	saveDataPeriodically(interval = Config?.database?.save_interval ?? 10_000) {
		setInterval(() => {
			this.#write();
		}, interval);
	}

	/**
	 * Retrieves the initialized status.
	 * @returns {boolean} True if the database is initialized, false otherwise.
	 */
	get hasInitialized() {
		return this.#initialized;
	}
}

const db = new Database();
export default db;
