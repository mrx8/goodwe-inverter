import Factory from 'stampit'
import GetStamp from '../../../shared/get-stamp.mjs'
import ReadUInt16BE from '../read-uint16be.mjs'


export default Factory
  .compose(
    GetStamp,
    ReadUInt16BE,
  )

  .configuration({
    BMS_ALARM_CODES: {
      0 : 'Charging over-voltage 2',
      1 : 'Discharging under-voltage 2',
      2 : 'Cell temperature high 2',
      3 : 'Cell temperature low 2',
      4 : 'Charging over-current 2',
      5 : 'Discharging over-current 2',
      6 : 'Precharge fault',
      7 : 'DC bus fault',
      8 : 'Battery break',
      9 : 'Battery lock',
      10: 'Discharging circuit failure',
      11: 'Charging circuit failure',
      12: 'Communication failure 2',
      13: 'Cell temperature high 3',
      14: 'Discharging under-voltage 3',
      15: 'Charging over-voltage 3',
    },
  })

  .methods({
    readErrorCodeHigh (register) {
      return this.readUInt16BE(register)
    },

    readErrorCodeLow (register) {
      return this.readUInt16BE(register)
    },

    readError (registerLow, registerHigh) {
      const errorCodeHigh = this.readErrorCodeHigh(registerHigh)
      const errorCodeLow = this.readErrorCodeLow(registerLow)

      let errorNumber = errorCodeHigh << 16 + errorCodeLow
      const result = []
      for (let i = 0; i < 32; i++) {
        if (errorNumber & 1 === 1) {
          result.push(
            this.getStampConfiguration().BMS_ALARM_CODES[i] || `unknown alarmcode ${i}`,
          )
        }
        errorNumber = errorNumber >> 1
      }

      return result.join(', ')
    },

  })
