import Factory from 'stampit'
import {readUInt16BE as ReadUInt16BE} from './read-uint16be.mjs'


export default Factory
  .compose(ReadUInt16BE)

  .methods({
    _readArmSubVersion (register) {
      return this._readUInt16BE(register)
    },
  })
