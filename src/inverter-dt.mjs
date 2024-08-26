import {createRtuRequestMessage, validateRtuResponseMessage} from './modbus.mjs'
import {decode, readUInt16BE} from './shared.mjs'
import Protocol from './protocol.mjs'
import RegisterParser from './register-parser.mjs'


async function readDeviceInfo () {
  const offset = 0x7531
  const value = 0x0028

  const message = createRtuRequestMessage(this.modbusCommandAdress, offset, value)
  const responseMessage = await this.requestResponse(message)
  const isValid = validateRtuResponseMessage(responseMessage, this.modbusCommandAdress, offset, value)
  if (isValid) {
    return {
      valid        : true,
      serialNumber : decode(responseMessage.subarray(11, 27)), // 30004 - 30012
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


async function readRunningData () {
  const registerStart = 30100
  const registerCount = 73

  const message = createRtuRequestMessage(this.modbusCommandAdress, registerStart, registerCount)
  const responseMessage = await this.requestResponse(message)
  const isValid = validateRtuResponseMessage(responseMessage, this.modbusCommandAdress, registerStart, registerCount)
  if (isValid) {
    const parser = RegisterParser({
      message       : responseMessage.subarray(5),
      registerOffset: registerStart,
    })

    return {
      valid      : true,
      timestamp  : parser.readTimestamp(30100),
      pv1_voltage: parser.readVoltage(30103),
      pv1_current: parser.readVoltage(30104),
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
    instance.family = 'DT'
    instance.modbusCommandAdress = 0x7f
    instance.deviceInfo = await readDeviceInfo.call(instance)
    instance.deviceInfo = await readRunningData.call(instance)

    return instance
  })
