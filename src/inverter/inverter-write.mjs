import Factory from 'stampit'
import GetStamp from '../shared/get-stamp.mjs'
import Log from '../shared/log.mjs'
import Param from '../shared/param.mjs'
import WriteMessage from '../../src/_bricks/reader/network/write-message.mjs'

export default Factory
  .compose(
    GetStamp,
    Param,
    Log,
  )

  .setLogId('inverter-write')

  .init((param, {instance}) => {
    instance.writer = WriteMessage({
      ...param,
      address: instance.address,
    })

    return instance
  })

  .methods({
    getWriteableStates () {
      return this.getStampConfiguration().writeableStates || []
    },


    writeRegister (register, registerValue) {
      return this.writer.writeMessage({
        register,
        registerValue,
      })
    },
  })
