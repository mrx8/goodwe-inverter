import Factory from 'stampit'
import ReadVoltage from './read-voltage.mjs'

export default Factory
  .compose(ReadVoltage)

  .methods({
    readMeterVoltage (register) {
      return this.readVoltage(register)
    },
  })
