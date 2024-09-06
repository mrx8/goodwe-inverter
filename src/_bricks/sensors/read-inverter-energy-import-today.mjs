import Factory from 'stampit'
import ReadUInt16BE from './read-uint16be.mjs'


export default Factory
  .compose(ReadUInt16BE)

  .methods({
    readInverterEnergyImportToday (register) {
      const value = this.readUInt16BE(register)

      return value / 10
    },
  })
