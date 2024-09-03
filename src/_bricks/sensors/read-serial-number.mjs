import Factory from 'stampit'
import ReadString from './read-string.mjs'


export default Factory
  .compose(ReadString)

  .methods({
    readSerialNumber (register) {
      return this.readString(register, 16)
    },
  })
