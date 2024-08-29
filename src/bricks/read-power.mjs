import Factory from 'stampit'
import ReadUInt32BE from './read-uint32be.mjs'


export default Factory
  .compose(ReadUInt32BE)

  .methods({
    _readPower (register) {
      return this._readUInt32BE(register)
    },
  })
