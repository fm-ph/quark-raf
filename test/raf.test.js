import Raf from '../src/index'

beforeEach(() => {
  Raf.unbind()
})

describe('Raf private attributes', () => {
  it('Expect Raf singleton instance', () => {
    expect(typeof Raf).toBe('object')
  })

  it('Expect Raf instance listeners to be empty by default', () => {
    expect(Raf._listeners).toEqual([])
  })

  it('Expect Raf instance to be not binded by default', () => {
    expect(Raf._binded).toBeFalsy()
  })
})

describe('Raf public methods', () => {
  it('Bind Raf instance', () => {
    Raf.bind()

    expect(Raf._binded).toBeTruthy()
    expect(Raf._raf).toBe(1)
  })

  it('Unbind Raf instance', () => {
    Raf.bind()
    Raf.unbind()

    expect(Raf._binded).toBeFalsy()
    expect(Raf._raf).toBeNull()
    expect(Raf._listeners).toEqual([])
  })

  it('Add a Raf listener', done => {
    const callback = jest.fn((delta, elapsedTime, now) => {
      expect(delta).not.toBeUndefined()
      expect(elapsedTime).not.toBeUndefined()
      expect(now).not.toBeUndefined()

      if (callback.mock.calls.length > 1) { // Test multiple calls
        expect(callback).toHaveBeenCalledTimes(2)
        done()
      }
    })

    Raf.add(callback)
  })

  it('Expect add Raf listener returns data', done => {
    const callback = jest.fn(() => {
      expect(callback).toHaveBeenCalledTimes(1)
      done()
    })

    const data = Raf.add(callback)

    const expected = {
      id: 0,
      callback,
      fps: 60,
      delay: 0,
      once: false,
      lastTime: data.lastTime
    }

    expect(data).toMatchObject(expected)
    expect(Raf._listeners).toMatchObject([expected])
    expect(Raf._listeners).toHaveLength(1)
  })

  it('Add Raf listener with targeted FPS', done => {
    const callback = jest.fn(() => done())
    const data = Raf.add(callback, 30)

    expect(data).toHaveProperty('fps', 30)
  })

  it('Add Raf listener with a delay', done => {
    const callback = jest.fn(() => done())
    const data = Raf.add(callback, 60, 1000)

    expect(data).toHaveProperty('delay', 1000)
  })

  it('Add once a Raf listener', done => {
    const callback = jest.fn(() => {
      expect(callback).toHaveBeenCalledTimes(1)
      done()
    })

    Raf.addOnce(callback)
  })

  it('Remove a Raf listener', () => {
    const callback = jest.fn()

    Raf.add(callback)
    expect(Raf._listeners).toHaveLength(1)

    Raf.remove(callback)
    expect(Raf._listeners).toHaveLength(0)
  })
})

describe('Raf errors/warnings', () => {
  let spy = {}

  beforeEach(() => {
    spy.error = jest.spyOn(console, 'error').mockImplementation(() => { })
    spy.warn = jest.spyOn(console, 'warn').mockImplementation(() => { })
  })

  afterEach(() => {
    for (const level in spy) {
      const spyFn = spy[level]
      spyFn.mockRestore()
    }
  })

  it('Add a callback listener with a bad type', () => {
    Raf.add(false)

    expect(console.error).toHaveBeenCalledTimes(1)
    expect(console.error.mock.calls[0][0]).toContain('add() : Callback argument must be a function')
  })

  it('Remove a callback listener with a bad type', () => {
    Raf.remove(false)

    expect(console.error).toHaveBeenCalledTimes(1)
    expect(console.error.mock.calls[0][0]).toContain('remove() : Callback argument must be a function')
  })

  it('Bind Raf instance two times', () => {
    Raf.bind()
    Raf.bind()

    expect(console.warn).toHaveBeenCalledTimes(1)
    expect(console.warn.mock.calls[0][0]).toContain('Raf instance is already binded')
  })
})
