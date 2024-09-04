import Base from './sensor-base.mjs'
import Factory from 'stampit'
import IndexRegister from './index-register.mjs'


export default Factory
  .compose(
    Base,
    IndexRegister,
  )

  .methods({
    readFloatBE (register) {
      const index = this.getIndexFromRegister(register)

      return this.message.readFloatBE(index)
    },
  })
