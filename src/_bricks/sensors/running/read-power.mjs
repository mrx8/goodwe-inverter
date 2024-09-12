import Factory from 'stampit'
import ReadInt16BE from '../read-int16be.mjs'
import ReadUInt32BE from '../read-uint32be.mjs'


export default Factory
  .compose(
    ReadInt16BE,
    ReadUInt32BE,
  )

  .methods({
    readPower (register) {
      return this.readUInt32BE(register)
    },

    readPower16 (register) {
      return this.readInt16BE(register)
    },
  })
