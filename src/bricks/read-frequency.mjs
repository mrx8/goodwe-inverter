import Factory from 'stampit'
import {readInt16BE as ReadInt16BE} from './read-int16be.mjs'


export default Factory
  .compose(ReadInt16BE)

  .methods({
    _readFrequency (register) {
      const value = this._readInt16BE(register)

      return value / 100
    },
  })
