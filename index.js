const { v4: uuid } = require('uuid')

class Timegate {

  constructor(options = {}) {

    this.name = options.name || uuid()
    this.meta = {}

    this.container = {}

    this.gateTimeout = options.gateTimeout || 3 * 60e3
    this.throwOnError = options.throwOnError || false
  }

  #timerExists(timer) {
    return this.container[timer]
  }

  #returnError(error) {
    if (this.throwOnError) throw error
    return { error }
  }

  setData(key, value) {
    this.meta[key] = value
  }

  getData(key) {
    return this.meta[key]
  }

  start(name) {
    if (this.#timerExists(name)) return this.#returnError(`Timegate named ${name} already exists`)

    this.container[name] = {
      startTime: Date.now(),
      endTime: null,
      series: {}
    }

    // memleak prevention
    setTimeout(() => delete this.container[name], this.gateTimeout)
  }

  stop(name) {
    const timer = this.#timerExists(name)
    if (!timer) return this.#returnError(`Timegate named ${name} does not exist`)

    timer.endTime = Date.now()

    delete this.container[name]

    return {
      parent: this.name,
      name,
      startTime: timer.startTime,
      endTime: timer.endTime,
      totalTime: timer.endTime - timer.startTime,
      meta: this.meta,
      series: Object.values(timer.series)
    }
  }

  gate(timer, name) {
    if (!this.#timerExists(timer)) return this.#returnError(`Timegate named ${timer} does not exist`)

    if (this.container[timer].series?.[name]) {
      return this.#returnError(`Gate ${name} already exists`)
    }

    this.container[timer].series[name] = {
      name: `${timer}.${name}`,
      startTime: Date.now(),
      endTime: null,
      sinceStart: Date.now() - this.container[timer].startTime
    }

    return this.container[timer].series[name]
  }

  gateEnd(timer, name) {
    if (!this.#timerExists(timer)) return this.#returnError(`Timegate named ${timer} does not exist`)

    if (!this.container[timer].series?.[name]) {
      return this.#returnError(`Gate ${name} does not exist`)
    }

    this.container[timer].series[name].endTime = Date.now()

    return this.container[timer].series[name]
  }
}

module.exports = Timegate