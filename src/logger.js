import { Logger, plugins } from 'quark-log'
import { name } from '../package.json'

const logger = new Logger()
logger.plugin('namespace', plugins.namespace, { name })

export default logger
