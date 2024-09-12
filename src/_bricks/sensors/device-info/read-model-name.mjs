import Factory from 'stampit'
import ReadString from '../read-string.mjs'


export default Factory
  .compose(ReadString)

  .methods({
    readModelName (register) {
      return this.readString(register, 10)
    },
  })
