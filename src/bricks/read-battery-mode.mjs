import {BATTERY_MODES} from '../constants.mjs'
import Factory from 'stampit'

export default Factory
  .methods({
    readBatteryModeCode (register) {
      return this.readUInt16BE(register)
    },

    readBatteryMode (register) {
      const value = this.readBatteryModeCode(register)

      return BATTERY_MODES[value] || 'unknown'
    },
  })
