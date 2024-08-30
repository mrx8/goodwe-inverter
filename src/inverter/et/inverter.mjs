import BatteryDataParser from './battery-data-parser.mjs'
import DeviceInfoParser from './device-info-parser.mjs'
import Factory from 'stampit'
import GetBatteryData from '../../bricks/get-battery-data.mjs'
import GetDeviceInfo from '../../bricks/get-device-info.mjs'
import GetRunningData from '../../bricks/get-running-data.mjs'
import InverterBase from '../../bricks/inverter-base.mjs'
import Network from '../../network.mjs'
import RunningDataParser from './running-data-parser.mjs'


export default Factory
  .compose(
    Network,
    InverterBase,
    GetBatteryData,
    GetDeviceInfo,
    GetRunningData,
  )

  .configuration({
    BatteryDataParser,
    DeviceInfoParser,
    RunningDataParser,
  })

  .init(async (param, {
    instance: instancePromise,
  }) => {
    const instance = await instancePromise
    instance.interface = 'ET'
    instance.address = 0xf7
    instance.deviceInfo = await instance.getDeviceInfo(35000, 33)
    instance.runningData = await instance.getRunningData(35100, 125)
    if (instance.runningData.batteryModeCode > 0) {
      Object.assign(instance.runningData, await instance.getBatteryData(37000, 24))
    }

    return instance
  })
