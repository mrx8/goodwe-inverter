import Factory from 'stampit'
import ReadInt16BE from './read-int16be.mjs'


export default Factory
  .compose(ReadInt16BE)

  .methods({
    readMeterFrequency (register) {
      const value = this.readInt16BE(register)

      return value / 100
    },
  })
