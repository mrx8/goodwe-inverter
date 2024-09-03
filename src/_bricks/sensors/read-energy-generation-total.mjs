import Factory from 'stampit'
import ReadUInt32BE from './read-uint32be.mjs'


export default Factory
  .compose(ReadUInt32BE)

  .methods({
    readEnergyGenerationTotal (register) {
      const value = this.readUInt32BE(register)

      return value / 10
    },
  })
