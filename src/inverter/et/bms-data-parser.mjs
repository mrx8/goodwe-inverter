import Factory from 'stampit'
import ReadBmsStateOfCharge from '../../bricks/read-bms-state-of-charge.mjs'
import ReadBmsStateOfHealth from '../../bricks/read-bms-state-of-health.mjs'

export default Factory
  .compose(
    ReadBmsStateOfCharge,
    ReadBmsStateOfHealth,
  )

  .init((param, {instance}) => {
    instance.bmsData = instance.bmsData || {}

    const data = {
      stateOfCharge: instance.readBmsStateOfCharge(37007),
      stateOfHealth: instance.readBmsStateOfHealth(37008),
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
