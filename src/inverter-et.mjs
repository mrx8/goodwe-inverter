import {createRtuRequestMessage, validateRtuRequestMessage} from './modbus.mjs'
import {decode, readUInt16BE} from './shared.mjs'
import Protocol from './protocol.mjs'


async function getDeviceInfo () {
  const offset = 0x88b8
  const value = 0x0021

  const message = createRtuRequestMessage(this.modbusCommandAdress, offset, value)
  const responseMessage = await this.requestResponse(message)
  const isValid = validateRtuRequestMessage(responseMessage, this.modbusCommandAdress, offset, value)
  if (isValid) {
    return {
      valid        : true,
      serialNumber : decode(responseMessage.subarray(11, 27)), // 35003 - 350010
      modelName    : decode(responseMessage.subarray(27, 37)),
      dsp1Version  : responseMessage.readUInt16BE(37), // 30034
      dsp2Version  : responseMessage.readUInt16BE(39), // 30035
      armVersion   : responseMessage.readUInt16BE(43), // 30036
      dspSvnVersion: readUInt16BE(responseMessage, 41), // 35037
      armSvnVersion: readUInt16BE(responseMessage, 45), // 35038
      firmware     : decode(responseMessage.subarray(47, 59)),
      armFirmware  : decode(responseMessage.subarray(59, 71)),
      ratedPower   : responseMessage.readUInt16BE(7),
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
    instance.deviceInfo = await getDeviceInfo.call(instance)

    return instance
  })
