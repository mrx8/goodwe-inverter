import Factory from 'stampit'
import ReadBmsNumberOfModules from '../../../_bricks/sensors/read-bms-number-of-modules.mjs'
import ReadBmsStateOfCharge from '../../../_bricks/sensors/read-bms-state-of-charge.mjs'
import ReadBmsStateOfHealth from '../../../_bricks/sensors/read-bms-state-of-health.mjs'
import ReadTemperature from '../../../_bricks/sensors/read-temperature.mjs'

export default Factory
  .compose(
    ReadBmsNumberOfModules,
    ReadBmsStateOfCharge,
    ReadBmsStateOfHealth,
    ReadTemperature,
  )

  .init((param, {instance}) => {
    instance.bmsData = instance.bmsData || {}

    const data = {
      stateOfCharge  : instance.readBmsStateOfCharge(37007),
      stateOfHealth  : instance.readBmsStateOfHealth(37008),
      temperature    : instance.readTemperature(37003),
      numberOfmodules: instance.readBmsNumberOfModules(37009),
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
