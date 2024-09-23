import DeviceInfoReader from '../../_bricks/reader/device-info-reader.mjs'
import DeviceInfoSensors from './_bricks/device-info-sensors.mjs'
import Factory from 'stampit'
import InverterBase from '../inverter-base.mjs'

// see https://github.com/MiG-41/Modbus-GoodWe-DT

export default Factory
  .compose(
    InverterBase,
  )

  .properties({
    address       : 0x7f,
    updateInterval: 4000,
  })

  .init(async (param, {
    instance,
  }) => {
    // compose the Factory for reading all relevant data for this kind of inverter
    let ReadDataFactory = Factory

    // device-info
    const ReadDeviceInfo = DeviceInfoReader.setup({
      ip           : instance.ip,
      port         : instance.port,
      timeout      : instance.timeout,
      address      : instance.address,
      registerStart: 30001,
      registerCount: 40,
      Sensors      : DeviceInfoSensors,
    })
    ReadDataFactory = ReadDataFactory.compose(ReadDeviceInfo)
    const deviceInfo = await ReadDeviceInfo()
    Object.assign(instance.data, deviceInfo)

    // running-data
    let RunningDataSensors = Factory
    const {default: RunningDataReader} = await import('../../_bricks/reader/running-data-reader.mjs')

    if (instance.data.deviceInfo.numberOfPhases === 3) {
      const {default: RunningDataSensorsThreePhases} = await import('./_bricks/running-data-sensors-three-phases.mjs')
      RunningDataSensors = RunningDataSensors.compose(RunningDataSensorsThreePhases)
    } else {
      const {default: RunningDataSensorsBasic} = await import('./_bricks/running-data-sensors-basic.mjs')
      RunningDataSensors = RunningDataSensors.compose(RunningDataSensorsBasic)
    }

    const ReadRunningData = RunningDataReader.setup({
      ip           : instance.ip,
      port         : instance.port,
      timeout      : instance.timeout,
      address      : instance.address,
      registerStart: 30100,
      registerCount: 73,
      Sensors      : RunningDataSensors,
    })
    ReadDataFactory = ReadDataFactory.compose(ReadRunningData)
    const runningData = await ReadRunningData()
    Object.assign(instance.data, runningData)

    // meter data is curently only 1 sensor which constantly provides -1 at least for XS-inverter => skipped for now

    // this composed factory fetch updates from the available sensors
    instance.ReadDataFactory = ReadDataFactory

    return instance
  })
