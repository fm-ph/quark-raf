import raf from 'quark-raf'

const callback = (delta, time, now) => console.log('delta', delta, 'time', time, 'now', now)
const fps = 30
const delay = 1000

raf.add(callback)

raf.add(callback, fps)

raf.add(callback, fps, delay)
