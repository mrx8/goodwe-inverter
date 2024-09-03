import Factory from 'stampit'
import ReadUInt16BE from './read-uint16be.mjs'


export default Factory
  .compose(ReadUInt16BE)

  .methods({
    readDsp1Version (register) {
      return this.readUInt16BE(register)
    },
  })
