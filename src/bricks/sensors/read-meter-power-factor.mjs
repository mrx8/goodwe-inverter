import Factory from 'stampit'
import ReadInt16BE from './read-int16be.mjs'

export default Factory
  .compose(ReadInt16BE)

  .methods({
    readMeterPowerFactor (register) {
      return this.readInt16BE(register) / 1000
    },
  })
