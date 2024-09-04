import Factory from 'stampit'
import GetStamp from '../../shared/get-stamp.mjs'
import ReadSerialNumber from './read-serial-number.mjs'

export const PLATFORM_745_LV_MODELS = [
  'ESN', 'EBN', 'EMN', 'SPN', 'ERN', 'ESC', 'HLB', 'HMB', 'HBB', 'EOA',
]

export const PLATFORM_745_HV_MODELS = [
  'ETU', 'ETT', 'HTA', 'HUB', 'AEB', 'SPB', 'CUB', 'EUB', 'HEB', 'ERB', 'BTT', 'ETF', 'ARB', 'URB', 'EBR',
]


export default Factory
  .compose(
    GetStamp,
    ReadSerialNumber,
  )

  .configuration({
    PLATFORM_745_LV_MODELS,
    PLATFORM_745_HV_MODELS,
  })

  .methods({
    readIs745Platform (register) {
      const serialNumber = this.readSerialNumber(register)

      for (const model of this.getStampConfiguration().PLATFORM_745_LV_MODELS) {
        if (serialNumber.includes(model)) {
          return true
        }
      }

      for (const model of this.getStampConfiguration().PLATFORM_745_HV_MODELS) {
        if (serialNumber.includes(model)) {
          return true
        }
      }

      return false
    },
  })
