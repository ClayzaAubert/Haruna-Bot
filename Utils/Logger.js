import Pino from "pino";
import Logger from "../Config/Logger.js";

export const logger = Pino({
	...Logger,
});
