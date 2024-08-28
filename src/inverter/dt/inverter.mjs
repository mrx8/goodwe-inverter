import {createRtuRequestMessage, validateRtuResponseMessage} from '../../modbus.mjs'
import DeviceInfoParser from './device-info-parser.mjs'
import Factory from 'stampit'
import InverterBase from '../inverter-base.mjs'
import {MODBUS_HEADER_LENGTH} from '../../modbus.mjs'
import Protocol from '../../protocol.mjs'
import RegisterParser from '../../parser/register-parser.mjs'


async function getDeviceInfo () {
  const registerStart = 30001
  const registerCount = 40

  const [isValid, responseMessage] = await this.readDeviceInfo({
    registerStart,
    registerCount,
  })

  if (isValid) {
    const deviceInfoParser = DeviceInfoParser({
      message: responseMessage.subarray(MODBUS_HEADER_LENGTH),
      registerStart,
    })

    return {
      valid: true,
      ...deviceInfoParser.parse(),
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


export default Factory
  .compose(Protocol, InverterBase)

  .init(async (param, {
    instance: instancePromise,
  }) => {
    const instance = await instancePromise
    instance.family = 'DT'
    instance.modbusCommandAdress = 0x7f
    instance.deviceInfo = await getDeviceInfo.call(instance)
    instance.runningData = await readRunningData.call(instance)

    return instance
  })
