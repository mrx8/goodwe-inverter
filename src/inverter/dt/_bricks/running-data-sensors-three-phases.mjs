import Factory from 'stampit'
import ReadCurrent from '../../../_bricks/sensors/read-current.mjs'
import ReadFrequency from '../../../_bricks/sensors/read-frequency.mjs'
import ReadVoltage from '../../../_bricks/sensors/read-voltage.mjs'
import RunningDataSensorsBasic from './running-data-sensors-basic.mjs'

export default Factory
  .compose(
    ReadCurrent,
    ReadFrequency,
    ReadVoltage,
    RunningDataSensorsBasic,
  )

  .init((param, {instance}) => {
    instance.runningData = instance.runningData || {}

    const data = {
      gridL1L2Voltage: instance.readVoltage(30115),
      gridL2L3Voltage: instance.readVoltage(30116),
      gridL3L1Voltage: instance.readVoltage(30117),

      gridL2Voltage: instance.readVoltage(30119),
      gridL3Voltage: instance.readVoltage(30120),

      gridL2Current: instance.readCurrent(30122),
      gridL3Current: instance.readCurrent(30123),

      gridL2Frequency: instance.readFrequency(30125),
      gridL3Frequency: instance.readFrequency(30126),
    }

    Object.assign(data, { // virtual-fields
      gridL2Power: Math.round(data.gridL2Voltage * data.gridL2Current),
      gridL3Power: Math.round(data.gridL3Voltage * data.gridL3Current),
    })

    Object.assign(instance.runningData, data)

    return instance
  })
