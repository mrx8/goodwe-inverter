import {MODBUS_ADDRESS, MODBUS_READ_CMD, validatePacket} from './modbus.mjs'
import {decode, determinePhases, readUInt16BE} from './shared.mjs'
import Protocol from './protocol.mjs'
import {createRtuRequestMessage} from './modbus.mjs'


async function getDeviceInfo () {
  const offset = 0x7531
  const value = 0x28

  const message = createRtuRequestMessage({
    address: MODBUS_ADDRESS,
    command: MODBUS_READ_CMD,
    offset,
    value,
  })

  const responseMessage = await this.requestResponse(message)

  const isValid = validatePacket(responseMessage, MODBUS_READ_CMD, offset, value)
  if (isValid) {
    const serialNumber = decode(responseMessage.subarray(11, 31)) // 30004 - 30012
    const modelName = responseMessage.subarray(27, 37).toString('ascii').trimEnd()
    const dsp1Version = responseMessage.readUInt16BE(71) // 30034
    const dsp2Version = responseMessage.readUInt16BE(73) // 30035
    const armVersion = responseMessage.readUInt16BE(75) // 30036
    const dspSvnVersion = readUInt16BE(responseMessage, 77) // 35037
    const armSvnVersion = readUInt16BE(responseMessage, 79) // 35038
    const firmwareVersion = `${dsp1Version}.${dsp2Version}.${armVersion}`
    const numberOfPhases = determinePhases(serialNumber)

    return {
      valid: true,
      serialNumber,
      modelName,
      dsp1Version,
      dsp2Version,
      armVersion,
      dspSvnVersion,
      armSvnVersion,
      firmwareVersion,
      numberOfPhases,
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
