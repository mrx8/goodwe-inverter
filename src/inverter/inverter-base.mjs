import {MODBUS_HEADER_LENGTH, createRtuRequestMessage, validateRtuResponseMessage} from '../modbus.mjs'
import Factory from 'stampit'


export default Factory
  .methods({
    async readMessage ({
      registerStart,
      registerCount,
    }) {
      const message = createRtuRequestMessage(this.address, registerStart, registerCount)
      const responseMessage = await this.requestResponse(message)
      const isValid = validateRtuResponseMessage(responseMessage, this.address, registerStart, registerCount)
      if (isValid === false) {
        throw new Error('response message is invalid!')
      }

      return responseMessage.subarray(MODBUS_HEADER_LENGTH)
    },
  })
