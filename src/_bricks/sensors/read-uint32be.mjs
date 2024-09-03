import Base from './sensor-base.mjs'
import Factory from 'stampit'
import IndexRegister from './index-register.mjs'


export default Factory
  .compose(
    Base,
    IndexRegister,
  )

  .methods({
    readUInt32BE (register) {
      const index = this.getIndexFromRegister(register)

      let value = this.message.readUInt32BE(index)
      if (value === 0xffffffff) {
        value = 0
      }

      return value
    },
  })
