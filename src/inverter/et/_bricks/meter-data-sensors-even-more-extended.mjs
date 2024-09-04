import Factory from 'stampit'
import MeterDataSensorsBasic from './meter-data-sensors-basic.mjs'
import MeterDataSensorsExtended from './meter-data-sensors-extended.mjs'
import ReadEnergyGenerationToday from '../../../_bricks/sensors/read-energy-generation-today.mjs'

export default Factory
  .compose(
    MeterDataSensorsBasic,
    MeterDataSensorsExtended,
    ReadEnergyGenerationToday,
  )

  .init((param, {instance}) => {
    instance.meterData = instance.meterData || {}

    const data = {
      energyExportToday: instance.readEnergyGenerationToday64(36092),
    }

    // voltage und currents
    // exported und imported
    Object.assign(instance.meterData, data)
  })
