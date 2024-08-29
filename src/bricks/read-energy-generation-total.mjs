import Factory from 'stampit'
import {readUInt32BE as ReadUInt32BE} from './read-uint32be.mjs'


export default Factory
  .compose(ReadUInt32BE)

  .methods({
    _readEnergyGenerationTotal (register) {
      const value = this._readUInt32BE(register)

      return value / 10
    },
  })
