import Factory from 'stampit'
import ReadFloatBE from './read-floatbe.mjs'

export default Factory
  .compose(
    ReadFloatBE,
  )

  .methods({
    readMeterEnergyTotal (register) {
      const value = this.readFloatBE(register)

      console.log('Value', value)

      return value / 1000
    },
  })
