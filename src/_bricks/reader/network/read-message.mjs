import {MODBUS_READ_COMMAND, MODBUS_READ_HEADER_LENGTH, createRtuRequestMessage, validateRtuResponseMessage} from './modbus.mjs'
import Factory from 'stampit'
import Log from '../../../shared/log.mjs'
import Network from './network.mjs'


export default Factory
  .compose(
    Log,
    Network,
  )

  .setLogId('readMessage')

  .properties({
    maxTries: 2,
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
    async readMessage ({
      registerStart,
      registerCount,
    }) {
      let error
      let count = 0

      while (++count <= this.maxTries) {
        this.log.trace(
          'readMessage try #%d/%d for address 0x%s from 0x%s to 0x%s',
          count, this.maxTries, this.address.toString(16), registerStart.toString(16), registerCount.toString(16),
        )

        try {
          const message = createRtuRequestMessage(this.address, MODBUS_READ_COMMAND, registerStart, registerCount)
          const responseMessage = await this.requestResponse(message) // eslint-disable-line no-await-in-loop
          // Note: Sometimes we get back invalid data. Maybe the inverter sent a response to us which was intended for another requester.
          // I have no detailed documentation about the request/response-cycle from GoodWe-Inverters...
          // therefore I try it again even in this case.
          this.log.trace(
            'validateMessage for address 0x%s from 0x%s with length 0x%s',
            this.address.toString(16), registerStart.toString(16), (registerCount * 2).toString(16),
          )
          validateRtuResponseMessage(responseMessage, this.address, MODBUS_READ_COMMAND, registerStart, registerCount)

          return responseMessage.subarray(MODBUS_READ_HEADER_LENGTH)
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
