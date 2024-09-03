import Factory from 'stampit'
import GetStamp from '../../shared/get-stamp.mjs'
import ReadUInt16BE from './read-uint16be.mjs'


export default Factory
  .compose(
    GetStamp,
    ReadUInt16BE,
  )

  .configuration({
    BATTERY_MODES: {
      0: 'No battery',
      1: 'Standby',
      2: 'Discharge',
      3: 'Charge',
      4: 'To be charged',
      5: 'To be discharged',
    },
  })

  .methods({
    readBatteryModeCode (register) {
      return this.readUInt16BE(register)
    },

    readBatteryMode (register) {
      const value = this.readBatteryModeCode(register)

      return this.getStampConfiguration().BATTERY_MODES[value] || 'unknown'
    },
  })
