import Factory from 'stampit'
import ReadInt16BE from './read-int16be.mjs'


export default Factory
  .compose(ReadInt16BE)

  .methods({
    _readInverterPower (register) {
      return this._readInt16BE(register)
    },
  })
