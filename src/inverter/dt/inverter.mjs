import DeviceInfoParser from './device-info-parser.mjs'
import Factory from 'stampit'
import InverterBase from '../inverter-base.mjs'
import Protocol from '../../protocol.mjs'
import RunningDataParser from './running-data-parser.mjs'

// see https://github.com/MiG-41/Modbus-GoodWe-DT

async function getDeviceInfo () {
  const registerStart = 30001
  const registerCount = 40

  const responseMessage = await this.readMessage({
    registerStart,
    registerCount,
  })

  return DeviceInfoParser({
    message: responseMessage,
    registerStart,
  })
}


async function getRunningData () {
  const registerStart = 30100
  const registerCount = 73

  const responseMessage = await this.readMessage({
    registerStart,
    registerCount,
  })

  return RunningDataParser({
    deviceInfo: this.deviceInfo,
    message   : responseMessage,
    registerStart,
  })
}


export default Factory
  .compose(Protocol, InverterBase)

  .init(async (param, {
    instance: instancePromise,
  }) => {
    const instance = await instancePromise
    instance.family = 'DT'
    instance.address = 0x7f
    instance.deviceInfo = await getDeviceInfo.call(instance)
    instance.runningData = await getRunningData.call(instance)

    return instance
  })
