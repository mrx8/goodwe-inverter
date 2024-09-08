import Base from './sensor-base.mjs'
import Factory from 'stampit'
import IndexRegister from './index-register.mjs'

export default Factory
  .compose(Base, IndexRegister)

  .methods({
    readTimestamp (register) {
      const index = this.getIndexFromRegister(register)

      const year = (2000 + this.message[index]).toString().padStart(4, '0')
      const month = this.message[index + 1].toString().padStart(2, '0')
      const day = this.message[index + 2].toString().padStart(2, '0')
      const hour = this.message[index + 3].toString().padStart(2, '0')
      const minute = this.message[index + 4].toString().padStart(2, '0')
      const second = this.message[index + 5].toString().padStart(2, '0')

      return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`).toISOString()
    },
  })
