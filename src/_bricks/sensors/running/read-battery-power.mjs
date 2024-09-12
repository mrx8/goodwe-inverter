import Factory from 'stampit'
import ReadInt32BE from '../read-int32be.mjs'


export default Factory
  .compose(ReadInt32BE)

  .methods({
    readBatteryPower (register) {
      return this.readInt32BE(register)
    },
  })
