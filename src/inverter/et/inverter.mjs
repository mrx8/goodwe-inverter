import {createRtuRequestMessage, validateRtuResponseMessage} from '../../modbus.mjs'
import DeviceInfoParser from './device-info-parser.mjs'
import Protocol from '../../protocol.mjs'


async function readDeviceInfo () {
  const registerStart = 35000
  const registerCount = 33

  const message = createRtuRequestMessage(this.modbusCommandAdress, registerStart, registerCount)
  const responseMessage = await this.requestResponse(message)
  const isValid = validateRtuResponseMessage(responseMessage, this.modbusCommandAdress, registerStart, registerCount)
  if (isValid) {
    const deviceInfoParser = DeviceInfoParser({
      message: responseMessage.subarray(5),
      registerStart,
    })

    return {
      valid: true,
      ...deviceInfoParser.parse(),
      // firmware     : decode(responseMessage.subarray(47, 59)),
      // armFirmware  : decode(responseMessage.subarray(59, 71)),
    }
  }

  return {
    valid: false,
  }
}


export default Protocol
  .init(async (param, {
    instance: instancePromise,
  }) => {
    const instance = await instancePromise
    instance.interface = 'ET'
    instance.modbusCommandAdress = 0xf7
    instance.deviceInfo = await readDeviceInfo.call(instance)

    return instance
  })
