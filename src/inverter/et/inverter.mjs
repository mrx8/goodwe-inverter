import DeviceInfoParser from './device-info-parser.mjs'
import Factory from 'stampit'
import InverterBase from '../inverter-base.mjs'
import Protocol from '../../protocol.mjs'


async function getDeviceInfo () {
  const registerStart = 35000
  const registerCount = 33

  const responseMessage = await this.readMessage({
    registerStart,
    registerCount,
  })

  const deviceInfoParser = DeviceInfoParser({
    message: responseMessage,
    registerStart,
  })

  return {
    ...deviceInfoParser.parse(),
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
