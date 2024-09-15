import Factory from 'stampit'
import ReadUInt16BE from '../read-uint16be.mjs'
import ReadUInt32BE from '../read-uint32be.mjs'


export default Factory
  .compose(
    ReadUInt16BE,
    ReadUInt32BE,
  )

  .methods({
    readEnergyBatteryChargeToday (register) {
      const value = this.readUInt16BE(register)

      return value / 10
    },


    readEnergyBatteryChargeTotal (register) {
      const value = this.readUInt32BE(register)

      return value / 10
    },
  })
