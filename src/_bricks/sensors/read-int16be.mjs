import Base from './sensor-base.mjs'
import Factory from 'stampit'
import IndexRegister from './index-register.mjs'


export default Factory
  .compose(
    Base,
    IndexRegister,
  )

  .methods({
    readInt16BE (register) {
      const index = this.getIndexFromRegister(register)

      let value = this.message.readInt16BE(index)
      if (value === 0xffff) {
        value = 0
      }

      return value
    },
  })
