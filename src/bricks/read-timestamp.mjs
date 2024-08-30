import Base from './parser-base.mjs'
import Factory from 'stampit'
import IndexRegister from './index-register.mjs'

export default Factory
  .compose(Base, IndexRegister)

  .methods({
    readTimestamp (register) {
      const index = this.getIndexFromRegister(register)

      const year = 2000 + this.message[index]
      const month = this.message[index + 1]
      const day = this.message[index + 2]
      const hour = this.message[index + 3]
      const minute = this.message[index + 4]
      const second = this.message[index + 5]

      return new Date(year, month, day, hour, minute, second)
    },
  })
