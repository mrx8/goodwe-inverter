import DeviceInfoReader from '../../_bricks/reader/device-info-reader.mjs'
import DeviceInfoSensors from './_bricks/device-info-sensors.mjs'
import Factory from 'stampit'
import InverterBase from '../inverter-base.mjs'


export default Factory
  .compose(
    InverterBase,
  )

  .properties({
    interface: 'ET',
    address  : 0xf7,
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
      registerStart: 35000,
      registerCount: 33,
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
      registerStart: 35100,
      registerCount: 125,
      Sensors      : RunningDataSensors,
    })
    ReadDataFactory = ReadDataFactory.compose(ReadRunningData)
    const runningData = await ReadRunningData()
    Object.assign(instance.data, runningData)

    // bms-data
    if (instance.data.runningData.batteryModeCode > 0) {
      const {default: BmsDataReader} = await import('../../_bricks/reader/bms-data-reader.mjs')
      const {default: BmsDataSensors} = await import('./_bricks/bms-data-sensors.mjs')
      const ReadBmsData = BmsDataReader.setup({
        ip           : instance.ip,
        port         : instance.port,
        timeout      : instance.timeout,
        address      : instance.address,
        registerStart: 37000,
        registerCount: 24,
        Sensors      : BmsDataSensors,
      })
      ReadDataFactory = ReadDataFactory.compose(ReadBmsData)
      const bmsData = await ReadBmsData()
      Object.assign(instance.data, bmsData)
    }

    // meter data
    if (instance.data.deviceInfo.is745Platform) {
      const {default: MeterDataReader} = await import('../../_bricks/reader/meter-data-reader.mjs')
      const {default: MeterDataSensors} = await import('./_bricks/meter-data-sensors-extended.mjs')
      const ReadMeterData = MeterDataReader.setup({
        ip           : instance.ip,
        port         : instance.port,
        timeout      : instance.timeout,
        address      : instance.address,
        registerStart: 36000,
        registerCount: 58,
        Sensors      : MeterDataSensors,
      })
      const meterData = await ReadMeterData()
      Object.assign(instance.data, meterData)
      ReadDataFactory = ReadDataFactory.compose(ReadMeterData)
    } else {
      const {default: MeterDataReader} = await import('../../_bricks/reader/meter-data-reader.mjs')
      const {default: MeterDataSensors} = await import('./_bricks/meter-data-sensors-basic.mjs')
      const ReadMeterData = MeterDataReader.setup({
        ip           : instance.ip,
        port         : instance.port,
        timeout      : instance.timeout,
        address      : instance.address,
        registerStart: 36000,
        registerCount: 45,
        Sensors      : MeterDataSensors,
      })
      const meterData = await ReadMeterData()
      Object.assign(instance.data, meterData)
      ReadDataFactory = ReadDataFactory.compose(ReadMeterData)
    }

    // this composed factory fetch updates from the available sensors
    instance.ReadDataFactory = ReadDataFactory

    return instance
  })
