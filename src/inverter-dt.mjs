import {createRtuRequestMessage, validateRtuRequestMessage} from './modbus.mjs'
import {decode, readUInt16BE} from './shared.mjs'
import Protocol from './protocol.mjs'


async function getDeviceInfo () {
  const offset = 0x7531
  const value = 0x0028

  const message = createRtuRequestMessage(offset, value)
  const responseMessage = await this.requestResponse(message)

  const isValid = validateRtuRequestMessage(responseMessage, offset, value)
  if (isValid) {
    return {
      valid        : true,
      serialNumber : decode(responseMessage.subarray(11, 31)), // 30004 - 30012
      modelName    : responseMessage.subarray(27, 37).toString('ascii').trimEnd(),
      dsp1Version  : responseMessage.readUInt16BE(71), // 30034
      dsp2Version  : responseMessage.readUInt16BE(73), // 30035
      armVersion   : responseMessage.readUInt16BE(75), // 30036
      dspSvnVersion: readUInt16BE(responseMessage, 77), // 35037
      armSvnVersion: readUInt16BE(responseMessage, 79), // 35038
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
    instance.interface = 'DT'
    instance.deviceInfo = await getDeviceInfo.call(instance)

    return instance
  })
