import Factory from 'stampit'

const utf16beDecoder = new TextDecoder('utf-16be')

export default Factory
  .methods({
    readUInt16BE (offset) {
      let value = this.message.readUInt16BE(offset)
      if (value === 65535) {
        value = 0
      }

      return value
    },


    decode (offset, length) {
      let isBinary = false
      const message = this.message.subarray(offset, offset + length)

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
