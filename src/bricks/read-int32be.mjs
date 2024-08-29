import Base from './parser-base.mjs'
import Factory from 'stampit'
import IndexRegister from './index-register.mjs'


export const readInt32BE = Factory
  .compose(Base, IndexRegister)

  .methods({
    _readInt32BE (register) {
      const index = this._getIndexFromRegister(register)

      let value = this.message.readInt32BE(index)
      if (value === 0xffffffff) {
        value = 0
      }

      return value
    },
  })
