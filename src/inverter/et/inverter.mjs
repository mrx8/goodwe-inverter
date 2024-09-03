import DeviceInfo from '../../bricks/reader/device-info-reader.mjs'
import DeviceInfoParser from './_bricks/device-info-parser.mjs'
import Factory from 'stampit'


export default Factory
  .init(async ({
    ip,
    port,
    timeout,
  }, {
    instance: instancePromise,
  }) => {
    const instance = await instancePromise
    instance.interface = 'ET'
    instance.address = 0xf7
    instance.ip = ip
    instance.port = port
    instance.timeout = timeout
    instance.data = {}

    // compose the Factory for reading all relevant data for this kind of inverter
    let ReadDataFactory = Factory

    // device-info
    const ReadDeviceInfo = await DeviceInfo.setup({
      ip           : instance.ip,
      port         : instance.port,
      address      : instance.address,
      registerStart: 35000,
      registerCount: 33,
      Parser       : DeviceInfoParser,
    })
    ReadDataFactory = ReadDataFactory.compose(ReadDeviceInfo)
    const deviceInfo = await ReadDeviceInfo()
    Object.assign(instance.data, deviceInfo)

    // running-data
    let RunningDataParser = Factory
    const {default: RunningData} = await import('../../bricks/reader/running-data-reader.mjs')

    if (instance.data.deviceInfo.numberOfPhases === 3) {
      const {default: RunningDataParserThreePhases} = await import('./_bricks/running-data-parser-three-phases.mjs')
      RunningDataParser = RunningDataParser.compose(RunningDataParserThreePhases)
    } else {
      const {default: RunningDataParserBasic} = await import('./_bricks/running-data-parser-basic.mjs')
      RunningDataParser = RunningDataParser.compose(RunningDataParserBasic)
    }

    const ReadRunningData = await RunningData.setup({
      ip           : instance.ip,
      port         : instance.port,
      address      : instance.address,
      registerStart: 35100,
      registerCount: 125,
      Parser       : RunningDataParser,
    })
    ReadDataFactory = ReadDataFactory.compose(ReadRunningData)
    const runningData = await ReadRunningData()
    Object.assign(instance.data, runningData)

    // bms-data
    if (instance.data.runningData.batteryModeCode > 0) {
      const {default: BmsData} = await import('../../bricks/reader/bms-data-reader.mjs')
      const {default: BmsDataParser} = await import('./_bricks/bms-data-parser.mjs')
      const ReadBmsData = await BmsData.setup({
        ip           : instance.ip,
        port         : instance.port,
        address      : instance.address,
        registerStart: 37000,
        registerCount: 24,
        Parser       : BmsDataParser,
      })
      ReadDataFactory = ReadDataFactory.compose(ReadBmsData)
      const bmsData = await ReadBmsData()
      Object.assign(instance.data, bmsData)
    }

    // meter data
    if (deviceInfo.is745Platform) {
      const {default: MeterData} = await import('../../bricks/reader/meter-data-reader.mjs')
      const {default: MeterDataParser} = await import('./_bricks/meter-data-parser-even-more-extended.mjs')
      const ReadMeterData = await MeterData.setup({
        ip           : instance.ip,
        port         : instance.port,
        address      : instance.address,
        registerStart: 36000,
        registerCount: 125,
        Parser       : MeterDataParser,
      })

      try {
        const meterData = await ReadMeterData()
        Object.assign(instance.data, meterData)
        ReadDataFactory = ReadDataFactory.compose(ReadMeterData)
      } catch (e) {
        console.log('ROHR', e )
        if (e.code !== '') {
          throw e
        }

        const {default: MeterDataParser} = await import('./_bricks/meter-data-parser-extended.mjs')
        const ReadMeterData = await MeterData.setup({
          ip           : instance.ip,
          port         : instance.port,
          address      : instance.address,
          registerStart: 36000,
          registerCount: 58,
          Parser       : MeterDataParser,
        })
        const meterData = await ReadMeterData()
        Object.assign(instance.data, meterData)
        ReadDataFactory = ReadDataFactory.compose(ReadMeterData)
      }
    } else {
      const {default: MeterData} = await import('../../bricks/reader/meter-data-reader.mjs')
      const {default: MeterDataParser} = await import('./_bricks/meter-data-parser-basic.mjs')
      const ReadMeterData = await MeterData.setup({
        ip           : instance.ip,
        port         : instance.port,
        address      : instance.address,
        registerStart: 36000,
        registerCount: 45,
        Parser       : MeterDataParser,
      })
      const meterData = await ReadMeterData()
      Object.assign(instance.data, meterData)
      ReadDataFactory = ReadDataFactory.compose(ReadMeterData)
    }

    // this composed factory fetch updates from the available sensors
    instance.ReadDataFactory = ReadDataFactory

    return instance
  })

  .methods({
    async update () {
      const data = await this.ReadDataFactory()
      Object.assign(this.data, data)

      return data
    },
  })
