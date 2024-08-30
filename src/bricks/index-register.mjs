import Factory from 'stampit'
import {ProgrammerError} from '../error.mjs'


export default Factory
  .init(({
    registerStart = 0,
  }, {instance}) => {
    instance.registerStart = registerStart

    return instance
  })


  .methods({
    getIndexFromRegister (register) {
      const index = (register - this.registerStart) * 2
      if (index < 0) {
        throw new ProgrammerError('register index is negative', 'CONFIG_ERROR')
      }

      return index
    },
  })
