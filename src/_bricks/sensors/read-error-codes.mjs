import Factory from 'stampit'
import GetStamp from '../../shared/get-stamp.mjs'
import ReadInt32BE from './read-int32be.mjs'


export default Factory
  .compose(
    GetStamp,
    ReadInt32BE,
  )

  .configuration({
    ERROR_CODES: {
      0 : 'GFCI Device Check Failure',
      1 : 'AC HCT Check Failure',
      2 : 'error2',
      3 : 'DCI Consistency Failure',
      4 : 'GFCI Consistency Failure',
      5 : 'error5',
      6 : 'GFCI Device Failure',
      7 : 'Relay Device Failure',
      8 : 'AC HCT Failure',
      9 : 'Utility Loss',
      10: 'Ground I Failure',
      11: 'DC Bus High',
      12: 'InternalFan Failure',
      13: 'Over Temperature',
      14: 'Utility Phase Failure',
      15: 'PV Over Voltage',
      16: 'External Fan Failure',
      17: 'Vac Failure',
      18: 'Isolation Failure',
      19: 'DC Injection High',
      20: 'Back-Up Over Load',
      21: 'error21',
      22: 'Fac Consistency Failure',
      23: 'Vac Consistency Failure',
      24: 'error24',
      25: 'Relay Check Failure',
      26: 'error26',
      27: 'PhaseAngleFailure',
      28: 'DSP communication failure',
      29: 'Fac Failure',
      30: 'EEPROM R/W Failure',
      31: 'Internal Communication Failure',
    },
  })

  .methods({
    readErrorCodes (register) {
      return this.readInt32BE(register)
    },

    readErrors (register) {
      const errorNames = this.getStampConfiguration().ERROR_CODES

      let value = this.readErrorCodes(register)
      if (value === -1) {
        value = 0
      }

      const result = []
      for (let i = 0; i < 32; i++) {
        if (value & 1 === 1) {
          const errorName = errorNames[i] || 'errorUnknown'
          result.push(errorName)
        }
        value = value >> 1
      }

      return result.join(', ')
    },
  })
