import { Logger, plugins } from 'quark-log'

const logger = new Logger()
logger.plugin('namespace', plugins.namespace, { name: 'quark-raf' })

export default logger
