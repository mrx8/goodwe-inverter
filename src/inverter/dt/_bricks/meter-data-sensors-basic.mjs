import Factory from 'stampit'
import ReadMeterActivePower from '../../../_bricks/sensors/read-meter-active-power.mjs'


export default Factory
  .compose(
    ReadMeterActivePower,
  )

  .init((param, {instance}) => {
    instance.meterData = instance.meterData || {}

    const data = {
      activePower: instance.readMeterActivePower16(30196),
    }

    Object.assign(instance.meterData, data)

    return instance
  })

  .methods({
    getData () {
      return {
        meterData: this.meterData,
      }
    },
  })
