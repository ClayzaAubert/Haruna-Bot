import { makeInMemoryStore } from "baileys";
import { logger } from "./Logger.js";

export const Store = (log = logger) => {
	const store = makeInMemoryStore({ logger: log });
	return store;
};
