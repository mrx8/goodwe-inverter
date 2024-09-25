import Factory from 'stampit'
import Log from '../shared/log.mjs'
import Param from '../shared/param.mjs'
import WriteMessage from '../../src/_bricks/reader/network/write-message.mjs'

export default Factory
  .compose(
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
    writeRegister (register, registerValue) {
      return this.writer.writeMessage({
        register,
        registerValue,
      })
    },
  })
