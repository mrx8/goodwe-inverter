import Factory from 'stampit'
import ReadUInt16BE from '../read-uint16be.mjs'


export default Factory
  .compose(ReadUInt16BE)

  .methods({
    readBatteryFastChargeEnable (register) {
      return this.readUInt16BE(register)
    },

    readBatteryFastChargeStopStateOfCharge (register) {
      return this.readUInt16BE(register)
    },
  })
