import {createRtuRequestMessage, validateRtuResponseMessage} from '../modbus.mjs'
import Factory from 'stampit'


export default Factory
  .methods({
    async readMessage ({
      registerStart,
      registerCount,
    }) {
      const message = createRtuRequestMessage(this.modbusCommandAdress, registerStart, registerCount)
      const responseMessage = await this.requestResponse(message)
      const isValid = validateRtuResponseMessage(responseMessage, this.modbusCommandAdress, registerStart, registerCount)
      if (isValid === false) {
        throw new Error('response message is invalid!')
      }

      return responseMessage
    },
  })
