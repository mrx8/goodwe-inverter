import DecodeString from './decode-string.mjs'
import Factory from 'stampit'


export default Factory
  .compose(DecodeString)

  .methods({
    _readArmFirmware (register) {
      return this._decodeString(register, 12)
    },
  })
