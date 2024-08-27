import Base from './parser-base.mjs'
import Factory from 'stampit'
import IndexRegister from './index-register.mjs'


export const readUInt16BE = Factory
  .compose(Base, IndexRegister)

  .methods({
    _readUInt16BE (register) {
      const index = this._getIndexFromRegister(register)

      let value = this.message.readUInt16BE(index)
      if (value === 65535) {
        value = 0
      }

      return value
    },
  })
