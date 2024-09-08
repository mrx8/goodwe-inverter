import Factory from 'stampit'
import ReadInt16BE from './read-int16be.mjs'
import ReadInt32BE from './read-int32be.mjs'


export default Factory
  .compose(
    ReadInt16BE,
    ReadInt32BE,
  )

  .methods({
    readMeterPower16 (register) {
      return this.readInt16BE(register)
    },

    readMeterPower (register) {
      return this.readInt32BE(register)
    },
  })
