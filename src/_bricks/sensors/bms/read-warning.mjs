import Factory from 'stampit'
import GetStamp from '../../../shared/get-stamp.mjs'
import ReadUInt16BE from '../read-uint16be.mjs'


export default Factory
  .compose(
    GetStamp,
    ReadUInt16BE,
  )

  .configuration({
    BMS_WARNING_CODES: {
      0 : 'Charging over-voltage 1',
      1 : 'Discharging under-voltage 1',
      2 : 'Cell temperature high 1',
      3 : 'Cell temperature low 1',
      4 : 'Charging over-current 1',
      5 : 'Discharging over-current 1',
      6 : 'Communication failure 1',
      7 : 'System reboot',
      8 : 'Cell imbalance',
      9 : 'System temperature low 1',
      10: 'System temperature low 2',
      11: 'System temperature high',
    },
  })

  .methods({
    readWarningCodeHigh (register) {
      return this.readUInt16BE(register)
    },

    readWarningCodeLow (register) {
      return this.readUInt16BE(register)
    },

    readWarning (registerHigh, registerLow) {
      const warningCodeHigh = this.readWarningCodeHigh(registerHigh)
      const warningCodeLow = this.readWarningCodeLow(registerLow)

      let warningNumber = warningCodeHigh << 16 + warningCodeLow
      const result = []
      for (let i = 0; i < 32; i++) {
        if (warningNumber & 1 === 1) {
          result.push(
            this.getStampConfiguration().BMS_WARNING_CODES[i] || `unknown alarmcode ${i}`,
          )
        }
        warningNumber = warningNumber >> 1
      }

      return result.join(', ')
    },

  })
