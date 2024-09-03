import DeviceInfoParser from './device-info-parser.mjs'
import Factory from 'stampit'
import GetDeviceInfo from '../../_bricks/get-device-info.mjs'
import GetRunningData from '../../_bricks/get-running-data.mjs'
import InverterBase from '../../_bricks/read-message.mjs'
import Network from '../../network.mjs'
import RunningDataParser from './running-data-parser.mjs'

// see https://github.com/MiG-41/Modbus-GoodWe-DT

export default Factory
  .compose(
    Network,
    InverterBase,
    GetDeviceInfo,
    GetRunningData,
  )

  .configuration({
    DeviceInfoParser,
    RunningDataParser,
  })

  .init(async (param, {
    instance: instancePromise,
  }) => {
    const instance = await instancePromise
    instance.family = 'DT'
    instance.address = 0x7f
    instance.deviceInfo = await instance.getDeviceInfo(30001, 40)
    instance.runningData = await instance.getRunningData(30100, 73)

    return instance
  })
