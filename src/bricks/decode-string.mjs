import Base from './parser-base.mjs'
import Factory from 'stampit'
import IndexRegister from './index-register.mjs'

const utf16beDecoder = new TextDecoder('utf-16be')

export default Factory
  .compose(Base, IndexRegister)

  .methods({
    decodeString (register, length) {
      const index = this._getIndexFromRegister(register)

      let isBinary = false
      const message = this.message.subarray(index, index + length)

      for (const byte of message) {
        if (byte < 32) {
          isBinary = true
        }
      }

      if (isBinary) {
        return utf16beDecoder.decode(message).replace('\x00', '').trimEnd()
      }

      return message.toString('ascii').trimEnd()
    },
  })
