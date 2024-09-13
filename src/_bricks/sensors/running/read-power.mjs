import Factory from 'stampit'
import ReadUInt32BE from '../read-uint32be.mjs'


export default Factory
  .compose(
    ReadUInt32BE,
  )

  .methods({
    readPower (register) {
      return this.readUInt32BE(register)
    },
  })
