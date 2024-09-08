import Factory from 'stampit'
import ReadMeterPower from '../../../_bricks/sensors/read-meter-power.mjs'


export default Factory
  .compose(
    ReadMeterPower,
  )

  .init((param, {instance}) => {
    instance.meterData = instance.meterData || {}

    const data = {
      activePower: instance.readMeterPower16(30196),
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
