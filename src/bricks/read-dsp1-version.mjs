import Factory from 'stampit'
import ReadUInt16BE from './read-uint16be.mjs'


export default Factory
  .compose(ReadUInt16BE)

  .methods({
    _readDsp1Version (register) {
      return this._readUInt16BE(register)
    },
  })
