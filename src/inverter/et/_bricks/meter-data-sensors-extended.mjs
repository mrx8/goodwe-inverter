import Factory from 'stampit'
import MeterDataSensorsBasic from './meter-data-sensors-basic.mjs'


export default Factory
  .compose(
    MeterDataSensorsBasic,
  )

  .init((param, {instance}) => {
    return instance
  })
