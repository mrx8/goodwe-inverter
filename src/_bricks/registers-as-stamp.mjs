import Factory from 'stampit'
import {ProgrammerError} from '../shared/error.mjs'

const RegisterIntervalsSymbol = Symbol('registerIntervals')
const MaxRegisterDifference = 125 // GoodWe MODBUS-RTU obviously cannot transfer more than 125 registers


export default function () {
  return Factory
    .conf({
      [RegisterIntervalsSymbol]: [],
    })

    .deepConf({
      [RegisterIntervalsSymbol]: {},
    })

    .composers(({
      stamp,
    }) => { // runs on every compose
      const sortedRegisters = Object
        .keys(stamp.compose.deepConfiguration[RegisterIntervalsSymbol])
        .map(register => Number(register))
        .toSorted()

      const registerIntervals = []
      let start = 0

      for (let end = 1; end < sortedRegisters.length; end++) {
        if (sortedRegisters[end] - sortedRegisters[start] > MaxRegisterDifference) {
          registerIntervals.push(sortedRegisters.slice(start, end))
          start = end
        }
      }

      registerIntervals.push(sortedRegisters.slice(start))

      stamp.compose.configuration[RegisterIntervalsSymbol] = registerIntervals
    })

    .statics({
      add (register) {
        if (Number.isInteger(register) === false) {
          throw new ProgrammerError(`the param register ${register} is not an integer.`, 'PARAM_ERROR')
        }

        return this.deepConfiguration({
          [RegisterIntervalsSymbol]: {[register]: true},
        })
      },
    })

    .init((param, {
      stamp,
    }) => {
      for (const [startRegister, endRegister] of stamp.compose.configuration[RegisterIntervalsSymbol]) {
        console.log(`start: ${startRegister}    end: ${endRegister}`)
      }
    })
}
