import Factory from 'stampit'
import ReadBatteryStateOfCharge from '../../bricks/read-battery-state-of-charge.mjs'
import ReadBatteryStateOfHealth from '../../bricks/read-battery-state-of-health.mjs'

export default Factory
  .compose(
    ReadBatteryStateOfCharge,
    ReadBatteryStateOfHealth,
  )

  .init((param, {instance}) => {
    const data = {
      batteryStateOfCharge: instance.readBatteryStateOfCharge(37007),
      batteryStateOfHealth: instance.readBatteryStateOfHealth(37008),
    }

    return data
  })
