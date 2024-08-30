import Factory from 'stampit'
import ReadSerialNumber from './read-serial-number.mjs'
import {SINGLE_PHASE_MODELS} from '../constants.mjs'


export default Factory
  .compose(ReadSerialNumber)

  .methods({
    readNumberOfPhases (register) {
      const serialNumber = this.readSerialNumber(register)
      let phases = 3

      for (const model of SINGLE_PHASE_MODELS) {
        if (serialNumber.includes(model)) {
          phases = 1
        }
      }

      return phases
    },
  })
