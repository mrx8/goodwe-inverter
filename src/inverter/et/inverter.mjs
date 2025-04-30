import DeviceInfoSensors from './_bricks/device-info-sensors.mjs'
import Factory from 'stampit'
import InverterBase from '../inverter-base.mjs'
import ObjectAssignDeep from 'object-assign-deep'
import Reader from '../../_bricks/reader/reader.mjs'
import WriteData from './_bricks/write-data.mjs'

export default Factory
  .compose(
    InverterBase,
    WriteData,
  )

  .properties({
    address: 0xf7,
    // updateInterval: 5 * 1000,
  })

  .init(async (param, {
    instance,
  }) => {
    // compose the Factory for reading all relevant data for this kind of inverter
    let ReadDataFactory = Factory

    // device-info
    const ReadDeviceInfo = Reader.configuration({maxCalls: 1}).setup({
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
    ObjectAssignDeep(instance.data, deviceInfo)

    // running-data
    let RunningDataSensors = Factory

    if (instance.data.deviceInfo.numberOfPhases === 3) {
      const {default: RunningDataSensorsThreePhases} = await import('./_bricks/running-data-sensors-three-phases.mjs')
      RunningDataSensors = RunningDataSensors.compose(RunningDataSensorsThreePhases)
    } else {
      const {default: RunningDataSensorsBasic} = await import('./_bricks/running-data-sensors-basic.mjs')
      RunningDataSensors = RunningDataSensors.compose(RunningDataSensorsBasic)
    }

    const ReadRunningData = Reader.setup({
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
    ObjectAssignDeep(instance.data, runningData)

    // bms-data
    if (instance.data.runningData.batteryModeCode > 0) {
      const {default: BmsDataSensors} = await import('./_bricks/bms-data-sensors.mjs')
      const ReadBmsData = Reader.setup({
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
      ObjectAssignDeep(instance.data, bmsData)
    }

    // meter data
    if (instance.data.deviceInfo.is745Platform) {
      const {default: MeterDataSensors} = await import('./_bricks/meter-data-sensors-extended.mjs')
      const ReadMeterData = Reader.setup({
        ip           : instance.ip,
        port         : instance.port,
        timeout      : instance.timeout,
        address      : instance.address,
        registerStart: 36000,
        registerCount: 58,
        Sensors      : MeterDataSensors,
      })
      const meterData = await ReadMeterData()
      ObjectAssignDeep(instance.data, meterData)
      ReadDataFactory = ReadDataFactory.compose(ReadMeterData)
    } else {
      const {default: MeterDataSensors} = await import('./_bricks/meter-data-sensors-basic.mjs')
      const ReadMeterData = Reader.setup({
        ip           : instance.ip,
        port         : instance.port,
        timeout      : instance.timeout,
        address      : instance.address,
        registerStart: 36000,
        registerCount: 45,
        Sensors      : MeterDataSensors,
      })
      const meterData = await ReadMeterData()
      ObjectAssignDeep(instance.data, meterData)
      ReadDataFactory = ReadDataFactory.compose(ReadMeterData)
    }

    if (instance.data.runningData.batteryModeCode > 0) {
      // settings-data #1
      const {default: SettingsDataSensors1} = await import('./_bricks/settings-data-sensors1.mjs')
      const ReadSettingsData1 = Reader.setup({
        ip           : instance.ip,
        port         : instance.port,
        timeout      : instance.timeout,
        address      : instance.address,
        registerStart: 45356,
        registerCount: 1,
        Sensors      : SettingsDataSensors1,
      })
      ReadDataFactory = ReadDataFactory.compose(ReadSettingsData1)
      const settingsData1 = await ReadSettingsData1()
      ObjectAssignDeep(instance.data, settingsData1)

      // settings-data #1
      const {default: SettingsDataSensors2} = await import('./_bricks/settings-data-sensors2.mjs')
      const ReadSettingsData2 = Reader.setup({
        ip           : instance.ip,
        port         : instance.port,
        timeout      : instance.timeout,
        address      : instance.address,
        registerStart: 47511,
        registerCount: 93,
        Sensors      : SettingsDataSensors2,
      })
      ReadDataFactory = ReadDataFactory.compose(ReadSettingsData2)
      const settingsData2 = await ReadSettingsData2()
      ObjectAssignDeep(instance.data, settingsData2)
    }

    // this composed factory fetch updates from the available sensors
    instance.ReadDataFactory = ReadDataFactory

    return instance
  })
