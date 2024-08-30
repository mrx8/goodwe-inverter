import BatteryDataParser from './battery-data-parser.mjs'
import DeviceInfoParser from './device-info-parser.mjs'
import Factory from 'stampit'
import InverterBase from '../inverter-base.mjs'
import Protocol from '../../protocol.mjs'
import RunningDataParser from './running-data-parser.mjs'


async function getDeviceInfo () {
  const registerStart = 35000
  const registerCount = 33

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
  const registerStart = 35100
  const registerCount = 125

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


async function getBatteryData () {
  const registerStart = 37000
  const registerCount = 24

  const responseMessage = await this.readMessage({
    registerStart,
    registerCount,
  })

  return BatteryDataParser({
    message: responseMessage,
    registerStart,
  })
}


export default Factory
  .compose(Protocol, InverterBase)

  .init(async (param, {
    instance: instancePromise,
  }) => {
    const instance = await instancePromise
    instance.interface = 'ET'
    instance.address = 0xf7
    instance.deviceInfo = await getDeviceInfo.call(instance)
    instance.runningData = await getRunningData.call(instance)
    if (instance.runningData.batteryModeCode > 0) {
      Object.assign(instance.runningData, await getBatteryData.call(instance))
    }

    return instance
  })
