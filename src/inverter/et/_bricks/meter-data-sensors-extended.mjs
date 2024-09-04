import Factory from 'stampit'
import MeterDataSensorsBasic from './meter-data-sensors-basic.mjs'
import ReadCurrent from '../../../_bricks/sensors/read-current.mjs'
import ReadVoltage from '../../../_bricks/sensors/read-voltage.mjs'


export default Factory
  .compose(
    MeterDataSensorsBasic,
    ReadCurrent,
    ReadVoltage,
  )

  .init((param, {instance}) => {
    instance.meterData = instance.meterData || {}

    const data = {
      voltageL1: instance.readVoltage(36052),
      voltageL2: instance.readVoltage(36053),
      voltageL3: instance.readVoltage(36054),

      currentL1: instance.readCurrent(36055),
      currentL2: instance.readCurrent(36056),
      currentL3: instance.readCurrent(36057),
    }

    Object.assign(instance.meterData, data)

    return instance
  })
