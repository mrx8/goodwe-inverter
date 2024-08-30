import DecodeString from './decode-string.mjs'
import Factory from 'stampit'


export default Factory
  .compose(DecodeString)

  .methods({
    readSerialNumber (register) {
      return this.decodeString(register, 16)
    },
  })
