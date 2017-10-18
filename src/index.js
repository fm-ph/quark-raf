import raf from 'raf'

import logger from './logger'

/**
 * Raf class.
 *
 * @class
 *
 * @license https://opensource.org/licenses/MIT
 *
 * @author Patrick Heng & Fabien Motte <hengpatrick.pro@gmail.com/contact@fabienmotte.com>
 *
 * @example
 * const callback = () => { }
 * Raf.add(callback)
 */
class Raf {
  /**
   * Creates an instance of Raf.
   *
   * @constructor
   */
  constructor () {
    /**
     * Listeners.
     * @type Array
     * @private
     */
    this._listeners = []

    /**
     * Binded instance.
     * @type Boolean
     * @private
     */
    this._binded = false

    /**
     * Raf ID.
     * @type Number|null
     * @private
     */
    this._raf = null
  }

  /**
   * Bind update method.
   */
  bind () {
    if (this._binded === true) {
      return logger.warn('Raf instance is already binded')
    }

    this._binded = true
    this._update = this._update.bind(this)

    this._baseTime = Date.now()

    this._raf = raf(this._update)
  }

  /**
   * Unbind update method and remove all listeners.
   */
  unbind () {
    this._binded = false

    if (this._raf !== null) {
      raf.cancel(this._raf)
      this._raf = null
    }

    this._listeners = []
  }

  /**
   * Add a listener.
   *
   * @param {listenerCallback} callback Listener callback.
   * @param {Number} [fps=60] FPS targeted.
   * @param {Number} [delay=0] Delay in milliseconds before start.
   * @param {Boolean} [once=false] Call once.
   *
   * @returns {Object} Listener data.
   */
  add (callback, fps = 60, delay = 0, once = false) {
    if (typeof callback !== 'function') {
      return logger.error('add() : Callback argument must be a function')
    }

    const date = new Date()

    const data = {
      id: this._listeners.length,
      callback,
      fps,
      delay,
      once,
      deltaTargeted: 1000 / fps,
      lastTime: date.getTime()
    }

    this._listeners.push(data)

    if (!this._binded) {
      this.bind()
    }

    return data
  }

  /**
   * Add once listener.
   *
   * @param {listenerCallback} callback Listener callback.
   * @param {Number} [fps=60] FPS targeted.
   * @param {Number} [delay=0] Delay in milliseconds before start.
   *
   * @returns {Object} Listener data.
   */
  addOnce (callback, fps = 60, delay = 0) {
    return this.add(callback, fps, delay, true)
  }

  /**
   * Remove a listener.
   *
   * @param {listenerCallback} callback Listener callback.
   */
  remove (callback) {
    if (typeof callback !== 'function') {
      return logger.error('remove() : Callback argument must be a function')
    }

    for (let i = 0, l = this._listeners.length; i < l; i++) {
      if (this._listeners[i].callback === callback) {
        this._listeners.splice(i, 1)
        break
      }
    }
  }

  /**
   * Update.
   * @private
   */
  _update () {
    const now = Date.now()
    const elapsedTime = now - this._baseTime

    for (let i = 0; i < this._listeners.length; i++) {
      const data = this._listeners[i]
      const delta = now - data.lastTime

      if (delta < data.deltaTargeted && data.fps < 60) {
        continue
      }

      data.lastTime = now

      if (data.delay > 0) {
        if (elapsedTime < data.delay) {
          continue
        }
      }

      data.callback(delta, elapsedTime, now)

      if (data.once) {
        this.remove(data.callback)
      }
    }

    if (this._binded) {
      raf(this._update)
    }
  }
}

/**
 * Listener callback.
 *
 * @callback listenerCallback
 *
 * @param {Number} delta Delta between two frames in milliseconds.
 * @param {Number} elapsedTime Elapsed time in milliseconds since the Raf was binded.
 * @param {Number} now Current timestamp in milliseconds.
 */

export default new Raf()
