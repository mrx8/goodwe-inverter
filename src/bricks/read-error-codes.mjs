import Factory from 'stampit'
import ReadInt32BE from './read-int32be.mjs'


export default Factory
  .compose(ReadInt32BE)

  .methods({
    _readErrorCodes (register) {
      return this._readInt32BE(register)
    },
  })
