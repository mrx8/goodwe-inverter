import Factory from 'stampit'
import ReadInt16BE from '../read-int16be.mjs'


export default Factory
  .compose(ReadInt16BE)

  .methods({
    readTemperature (register) {
      const value = this.readInt16BE(register)
      if (value === -1 || value === 32767) {
        return 0
      }

      return value / 10
    },
  })
