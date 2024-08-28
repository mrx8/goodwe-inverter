import DeviceInfoParser from './device-info-parser.mjs'
import Factory from 'stampit'
import InverterBase from '../inverter-base.mjs'
import {MODBUS_HEADER_LENGTH} from '../../modbus.mjs'
import Protocol from '../../protocol.mjs'


async function getDeviceInfo () {
  const registerStart = 35000
  const registerCount = 33

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


export default Factory
  .compose(Protocol, InverterBase)

  .init(async (param, {
    instance: instancePromise,
  }) => {
    const instance = await instancePromise
    instance.interface = 'ET'
    instance.modbusCommandAdress = 0xf7
    instance.deviceInfo = await getDeviceInfo.call(instance)

    return instance
  })
