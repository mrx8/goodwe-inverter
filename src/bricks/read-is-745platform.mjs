import {PLATFORM_745_HV_MODELS, PLATFORM_745_LV_MODELS} from '../constants.mjs'
import Factory from 'stampit'
import ReadSerialNumber from './read-serial-number.mjs'


export default Factory
  .compose(ReadSerialNumber)

  .methods({
    readIs745Platform (register) {
      const serialNumber = this.readSerialNumber(register)

      for (const model of PLATFORM_745_LV_MODELS) {
        if (serialNumber.includes(model)) {
          return true
        }
      }

      for (const model of PLATFORM_745_HV_MODELS) {
        if (serialNumber.includes(model)) {
          return true
        }
      }

      return false
    },
  })
