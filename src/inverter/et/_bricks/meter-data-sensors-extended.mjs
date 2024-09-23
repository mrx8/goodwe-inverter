import Factory from 'stampit'
import MeterDataSensorsBasic from './meter-data-sensors-basic.mjs'
import ReadCurrent from '../../../_bricks/sensors/meter/read-current.mjs'
import ReadVoltage from '../../../_bricks/sensors/meter/read-voltage.mjs'


export default Factory
  .compose(
    MeterDataSensorsBasic,
    ReadCurrent,
    ReadVoltage,
  )

  .init((param, {instance}) => {
    Object.assign(instance.data.meterData, {
      voltageL1: instance.readVoltage(36052),
      voltageL2: instance.readVoltage(36053),
      voltageL3: instance.readVoltage(36054),

      currentL1: instance.readCurrent(36055),
      currentL2: instance.readCurrent(36056),
      currentL3: instance.readCurrent(36057),
    })

    return instance
  })
