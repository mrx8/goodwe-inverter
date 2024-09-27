import Factory from 'stampit'
import InverterWrite from '../../inverter-write.mjs'
import {ProgrammerError} from '../../../shared/error.mjs'

export default Factory
  .compose(
    InverterWrite,
  )

  .configuration({
    writeableStates: [
      'settingsData.batteryMinimumStateOfChargeOnGrid',
      'settingsData.batteryFastChargeEnable',
      'settingsData.batteryFastChargeStopStateOfCharge',
    ],
  })

  .methods({
    async writeBatteryMinimumStateOfChargeOnGrid (registerValue) {
      // 45356 BattSOCUnderMin RW U16 1 1 [0,100]
      const value = Number.parseInt(registerValue, 10)
      if (Number.isNaN(value) || value < 0 || value > 100) {
        throw new ProgrammerError('value is not an integer or not between [0,100]', 'PARAM_ERROR')
      }

      await this.writeRegister(45356, value)
    },

    async writeBatteryFastChargeEnable (registerValue) {
      // 47545 FastChargeEnable RW U16 1 1 [0,1] 0: Disable 1:Enable
      const value = Number.parseInt(registerValue, 10)
      if (Number.isNaN(value) || value < 0 || value > 1) {
        throw new ProgrammerError('value is not an integer or not between [0,1]', 'PARAM_ERROR')
      }

      await this.writeRegister(47545, value)
    },

    async writeBatteryFastChargeStopStateOfCharge (registerValue) {
      // 47546 FastChargeStopSoc RW U16 1 1 [0,100] => SoC zum stoppen des Ladevorgangs: immer mindestens current SoC + 2 sonst ILLEGAL_DATA_VALUE.
      const value = Number.parseInt(registerValue, 10)
      if (Number.isNaN(value) || value < 0 || value > 100) {
        throw new ProgrammerError('value is not an integer or not between [0,100]', 'PARAM_ERROR')
      }

      await this.writeRegister(47546, value)
    },
  })
