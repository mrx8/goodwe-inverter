import {BATTERY_MODES} from '../constants.mjs'
import Factory from 'stampit'

export default Factory
  .methods({
    _readBatteryModeCode (register) {
      return this._readUInt16BE(register)
    },

    _readBatteryMode (register) {
      const value = this._readBatteryModeCode(register)

      return BATTERY_MODES[value] || 'unknown'
    },
  })
