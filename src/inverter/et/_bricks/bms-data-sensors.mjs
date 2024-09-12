import Factory from 'stampit'
import ReadNumberOfModules from '../../../_bricks/sensors/bms/read-number-of-modules.mjs'
import ReadStateOfCharge from '../../../_bricks/sensors/bms/read-state-of-charge.mjs'
import ReadStateOfHealth from '../../../_bricks/sensors/bms/read-state-of-health.mjs'
import ReadTemperature from '../../../_bricks/sensors/bms/read-temperature.mjs'

export default Factory
  .compose(
    ReadNumberOfModules,
    ReadStateOfCharge,
    ReadStateOfHealth,
    ReadTemperature,
  )

  .init((param, {instance}) => {
    instance.bmsData = instance.bmsData || {}

    const data = {
      stateOfCharge  : instance.readStateOfCharge(37007),
      stateOfHealth  : instance.readStateOfHealth(37008),
      temperature    : instance.readTemperature(37003),
      numberOfmodules: instance.readNumberOfModules(37009),
    }

    Object.assign(instance.bmsData, data)

    return instance
  })

  .methods({
    getData () {
      return {
        bmsData: this.bmsData,
      }
    },
  })
