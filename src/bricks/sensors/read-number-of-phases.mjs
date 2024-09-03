import Factory from 'stampit'
import GetStamp from '../../shared/get-stamp.mjs'
import ReadSerialNumber from './read-serial-number.mjs'


export default Factory
  .compose(
    GetStamp,
    ReadSerialNumber,
  )

  .configuration({
    SINGLE_PHASE_MODELS: [
      'DSN', 'DST', 'NSU', 'SSN', 'SST', 'SSX', 'SSY', // DT
      'MSU', 'MST', 'PSB', 'PSC',
      'MSC', // Found on third gen MS
      'EHU', 'EHR', 'HSB', // ET
      'ESN', 'EMN', 'ERN', 'EBN', 'HLB', 'HMB', 'HBB', 'SPN',
    ],
  })

  .methods({
    readNumberOfPhases (register) {
      const serialNumber = this.readSerialNumber(register)
      let phases = 3

      for (const model of this.getStampConfiguration().SINGLE_PHASE_MODELS) {
        if (serialNumber.includes(model)) {
          phases = 1
        }
      }

      return phases
    },
  })
