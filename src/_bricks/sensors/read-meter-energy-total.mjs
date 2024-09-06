import Factory from 'stampit'
import ReadFloatBE from './read-floatbe.mjs'

export default Factory
  .compose(
    ReadFloatBE,
  )

  .methods({
    readMeterEnergyTotal (register) {
      const value = this.readFloatBE(register)

      return value / 1000
    },
  })
