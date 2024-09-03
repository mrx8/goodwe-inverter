import Factory from 'stampit'
import ReadCurrent from '../../../_bricks/sensors/read-current.mjs'
import ReadFrequency from '../../../_bricks/sensors/read-frequency.mjs'
import ReadInverterPower from '../../../_bricks/sensors/read-inverter-power.mjs'
import ReadVoltage from '../../../_bricks/sensors/read-voltage.mjs'
import RunningDataSensorsBasic from './running-data-sensors-basic.mjs'

export default Factory
  .compose(
    ReadCurrent,
    ReadFrequency,
    ReadInverterPower,
    ReadVoltage,
    RunningDataSensorsBasic,
  )

  .init((param, {instance}) => {
    instance.runningData = instance.runningData || {}

    const data = {
      gridL2Voltage  : instance.readVoltage(35126),
      gridL2Current  : instance.readCurrent(35127),
      gridL2Frequency: instance.readFrequency(35128),
      gridL2Power    : instance.readInverterPower(35130),

      gridL3Voltage  : instance.readVoltage(35131),
      gridL3Current  : instance.readCurrent(35132),
      gridL3Frequency: instance.readFrequency(35133),
      gridL3Power    : instance.readInverterPower(35135),
    }
    Object.assign(instance.runningData, data)

    return instance
  })
