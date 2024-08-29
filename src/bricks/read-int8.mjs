import Base from './parser-base.mjs'
import Factory from 'stampit'
import IndexRegister from './index-register.mjs'


export default Factory
  .compose(Base, IndexRegister)

  .methods({
    _readInt8 (register) {
      const index = this._getIndexFromRegister(register)

      return this.message.readInt8(index)
    },
  })
