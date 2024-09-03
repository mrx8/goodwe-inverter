import DecodeString from './decode-string.mjs'
import Factory from 'stampit'


export default Factory
  .compose(DecodeString)

  .methods({
    readFirmware (register) {
      return this.decodeString(register, 12)
    },
  })
