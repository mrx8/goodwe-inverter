import Factory from 'stampit'
import ReadCurrent from '../../../_bricks/sensors/running/read-current.mjs'
import ReadFrequency from '../../../_bricks/sensors/running/read-frequency.mjs'
import ReadVoltage from '../../../_bricks/sensors/running/read-voltage.mjs'
import RunningDataSensorsBasic from './running-data-sensors-basic.mjs'

export default Factory
  .compose(
    ReadCurrent,
    ReadFrequency,
    ReadVoltage,
    RunningDataSensorsBasic,
  )

  .properties({
    runningData: {},
  })

  .init((param, {instance}) => {
    Object.assign(instance.runningData, {
      gridL1L2Voltage: instance.readVoltage(30115),
      gridL2L3Voltage: instance.readVoltage(30116),
      gridL3L1Voltage: instance.readVoltage(30117),

      gridL2Voltage: instance.readVoltage(30119),
      gridL3Voltage: instance.readVoltage(30120),

      gridL2Current: instance.readCurrent(30122),
      gridL3Current: instance.readCurrent(30123),

      gridL2Frequency: instance.readFrequency(30125),
      gridL3Frequency: instance.readFrequency(30126),
    })

    Object.assign(instance.runningData, { // virtual-fields
      gridL2Power: Math.round(instance.runningData.gridL2Voltage * instance.runningData.gridL2Current),
      gridL3Power: Math.round(instance.runningData.gridL3Voltage * instance.runningData.gridL3Current),
    })

    Object.assign(instance.runningData, { // virtual-fields of virtual-fields
      gridPowerTotal: instance.runningData.gridL1Power + instance.runningData.gridL2Power + instance.runningData.gridL3Power,
    })


    return instance
  })
