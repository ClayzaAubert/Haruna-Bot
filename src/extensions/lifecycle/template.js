import { logger } from '#helpers/logger.js'

export default {
  name: 'template-extension',

  async init() {
    logger.info('[Template] Initialized')
  },

  async destroy() {
    logger.info('[Template] Destroyed')
  },
}
