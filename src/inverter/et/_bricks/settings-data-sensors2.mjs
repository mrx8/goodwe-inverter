import Factory from 'stampit'
import ReadBatteryFastCharge from '../../../_bricks/sensors/settings/read-battery-fast-charge.mjs'

export default Factory
  .compose(
    ReadBatteryFastCharge,
  )

  .init((param, {instance}) => {
    instance.data.settingsData = instance.data.settingsData || {}

    Object.assign(instance.data.settingsData, {
      batteryFastChargeEnable           : instance.readBatteryFastChargeEnable(47545),
      batteryFastChargeStopStateOfCharge: instance.readBatteryFastChargeStopStateOfCharge(47546),
    })

    return instance
  })
