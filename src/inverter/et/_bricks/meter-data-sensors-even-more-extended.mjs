import Factory from 'stampit'
import MeterDataSensorsBasic from './meter-data-sensors-basic.mjs'
import MeterDataSensorsExtended from './meter-data-sensors-extended.mjs'

export default Factory
  .compose(
    MeterDataSensorsBasic,
    MeterDataSensorsExtended,
  )

  .init((param, {instance}) => {
    return instance
  })
