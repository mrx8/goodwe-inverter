import {MODBUS_HEADER_LENGTH, MODBUS_READ_COMMAND, createRtuRequestMessage, validateRtuResponseMessage} from '../modbus.mjs'
import Factory from 'stampit'


export default Factory
  .methods({
    async readMessage ({
      registerStart,
      registerCount,
    }) {
      const message = createRtuRequestMessage(this.address, MODBUS_READ_COMMAND, registerStart, registerCount)
      const responseMessage = await this.requestResponse(message)
      validateRtuResponseMessage(responseMessage, this.address, MODBUS_READ_COMMAND, registerStart, registerCount)

      return responseMessage.subarray(MODBUS_HEADER_LENGTH)
    },
  })
