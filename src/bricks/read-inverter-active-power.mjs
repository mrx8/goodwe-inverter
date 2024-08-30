import Factory from 'stampit'
import ReadInt16BE from './read-int16be.mjs'


export default Factory
  .compose(ReadInt16BE)

  .methods({
    readInverterActivePower (register) {
      return this.readInt16BE(register)
    },
  })
