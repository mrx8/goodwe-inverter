import DeviceInfoParser from './device-info-parser.mjs'
import Factory from 'stampit'
import InverterBase from '../inverter-base.mjs'
import {MODBUS_HEADER_LENGTH} from '../../modbus.mjs'
import Protocol from '../../protocol.mjs'
import RegisterParser from './register-parser.mjs'


async function getDeviceInfo () {
  const registerStart = 30001
  const registerCount = 40

  const responseMessage = await this.readMessage({
    registerStart,
    registerCount,
  })

  const deviceInfoParser = DeviceInfoParser({
    message: responseMessage.subarray(MODBUS_HEADER_LENGTH),
    registerStart,
  })

  return {
    ...deviceInfoParser.parse(),
  }
}


async function getRunningData () {
  const registerStart = 30100
  const registerCount = 73

  const responseMessage = await this.readMessage({
    registerStart,
    registerCount,
  })
  const registerParser = RegisterParser({
    message: responseMessage.subarray(MODBUS_HEADER_LENGTH),
    registerStart,
  })

  return {
    ...registerParser.parse(),
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
    instance.runningData = await getRunningData.call(instance)

    return instance
  })
