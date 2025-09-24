import {MODBUS_WRITE_COMMAND, MODBUS_WRITE_HEADER_LENGTH, createRtuRequestMessage, validateRtuResponseMessage} from './modbus.mjs'
import Factory from 'stampit'
import Log from '../../../shared/log.mjs'
import Network from './network.mjs'


export default Factory
  .compose(
    Log,
    Network,
  )

  .setLogId('writeMessage')

  .properties({
    maxTries: 100,
  })

  .init(({
    address,
  }, {
    instance,
  }) => {
    instance.address = address

    return instance
  })

  .methods({
    async writeMessage ({
      register,
      registerValue,
    }) {
      let error
      let count = 0

      while (++count <= this.maxTries) {
        this.log.trace('writeMessage try #%d/%d', count, this.maxTries)
        try {
          const message = createRtuRequestMessage(this.address, MODBUS_WRITE_COMMAND, register, registerValue)
          const responseMessage = await this.requestResponse(message) // eslint-disable-line no-await-in-loop
          // Note: Sometimes we get back invalid data. Maybe the inverter sent a response to us which was intended for another requester.
          // I have no detailed documentation about the request/response-cycle from GoodWe-Inverters...
          // therefore I try it again even in this case.
          validateRtuResponseMessage(responseMessage, this.address, MODBUS_WRITE_COMMAND, register, registerValue)

          return {
            register     : responseMessage.readUInt16BE(MODBUS_WRITE_HEADER_LENGTH),
            registerValue: responseMessage.readUInt16BE(MODBUS_WRITE_HEADER_LENGTH + 2),
          }
        } catch (e) {
          if (e.code === 'PROTOCOL_ERROR') { // exit eagerly on PROTOCOL_ERROR because this is fatal
            throw e
          }

          error = e
        }
      }

      throw error
    },
  })
