import Factory from 'stampit'
import ReadUInt32BE from './read-uint32be.mjs'


export default Factory
  .compose(ReadUInt32BE)

  .methods({
    _readEnergyGenerationToday32 (register) {
      let value = this._readUInt32BE(register)
      if (value === 0xffffffff) {
        value = 0
      }

      return value / 10
    },
  })
