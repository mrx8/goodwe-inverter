import {createRtuRequestMessage, validateRtuResponseMessage} from '../modbus.mjs'
import Factory from 'stampit'


export default Factory
  .methods({
    async readDeviceInfo ({
      registerStart,
      registerCount,
    }) {
      const message = createRtuRequestMessage(this.modbusCommandAdress, registerStart, registerCount)
      const responseMessage = await this.requestResponse(message)
      const isValid = validateRtuResponseMessage(responseMessage, this.modbusCommandAdress, registerStart, registerCount)

      return [isValid, responseMessage]
    },
  })
