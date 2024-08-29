import Base from './parser-base.mjs'
import Factory from 'stampit'
import IndexRegister from './index-register.mjs'


export const readInt16BE = Factory
  .compose(Base, IndexRegister)

  .methods({
    _readInt16BE (register) {
      const index = this._getIndexFromRegister(register)

      let value = this.message.readInt16BE(index)
      if (value === 0xffff) {
        value = 0
      }

      return value
    },
  })
