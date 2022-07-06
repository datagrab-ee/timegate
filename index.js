const { v4: uuid } = require('uuid')

class Timegate {

  constructor(options = {}) {

    this.name = options.name || uuid()
    this.prefix = options.prefix || ''

    this.meta = {}
    this.series = {}

    this.startTime = Date.now()
    this.endTime = null
  }

  setData(key, value) {
    this.meta[key] = value
  }

  getData(key) {
    return this.meta[key]
  }

  start(name) {
    this.name = name || this.name
    this.startTime = Date.now()
  }

  stop() {
    this.endTime = Date.now()

    return {
      name: `${this.prefix}${this.name}`,
      startTime: this.startTime,
      endTime: this.endTime,
      totalTime: this.endTime - this.startTime,
      meta: this.meta,
      series: Object.values(this.series)
    }
  }

  gate(name) {
    if (this.series[name]) throw new Error(`Gate ${name} already exists`)

    this.series[name] = {
      name: `${this.name}.${name}`,
      startTime: Date.now(),
      endTime: null,
      sinceStart: Date.now() - this.startTime
    }

    return this.series[name]
  }

  gateEnd(name) {
    if (!this.series[name]) throw new Error(`Gate ${name} does not exist`)

    this.series[name].endTime = Date.now()

    return this.series[name]
  }
}

module.exports = Timegate