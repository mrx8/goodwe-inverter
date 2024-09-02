import {MODBUS_HEADER_LENGTH, MODBUS_READ_COMMAND, createRtuRequestMessage, validateRtuResponseMessage} from '../modbus.mjs'
import Factory from 'stampit'
import GetStamp from './get-stamp.mjs'
import Log from '../log.mjs'
import Network from '../network.mjs'


export default Factory
  .compose(
    GetStamp,
    Network,
  )

  .configuration({
    maxTries: 2,
    log     : Log,
  })

  .init(async ({
    address,
  }, {
    instance: instancePromise,
  }) => {
    const instance = await instancePromise
    instance.address = address

    return instance
  })

  .methods({
    async readMessage ({
      registerStart,
      registerCount,
    }) {
      let error
      const {maxTries, log} = this.getStampConfiguration()
      for (let count = 1; count <= maxTries; count++) {
        log.trace('readMessage try #%d/%d', count, maxTries)
        try {
          const message = createRtuRequestMessage(this.address, MODBUS_READ_COMMAND, registerStart, registerCount)
          const responseMessage = await this.requestResponse(message) // eslint-disable-line no-await-in-loop
          // Note: Sometimes we get back invalid data. Maybe the inverter sent a response to us which was intended for another requester.
          // I have no detailed documentation about the request/response-cycle from GoodWe-Inverters...
          // therefore I try it again even in this case.
          validateRtuResponseMessage(responseMessage, this.address, MODBUS_READ_COMMAND, registerStart, registerCount)

          return responseMessage.subarray(MODBUS_HEADER_LENGTH)
        } catch (e) {
          error = e
        }
      }
      throw error
    },
  })
