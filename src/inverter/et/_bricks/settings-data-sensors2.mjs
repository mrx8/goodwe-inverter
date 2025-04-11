import Factory from 'stampit'
import ReadBatteryFastCharge from '../../../_bricks/sensors/settings/read-battery-fast-charge.mjs'
import ReadEMSPower from '../../../_bricks/sensors/settings/read-ems-power.mjs'

export default Factory
  .compose(
    ReadEMSPower,
    ReadBatteryFastCharge,
  )

  .init((param, {instance}) => {
    instance.data.settingsData = instance.data.settingsData || {}

    Object.assign(instance.data.settingsData, {
      EMSPowerMode                      : instance.readEMSPowerMode(47511),
      EMSPowerSet                       : instance.readEMSPowerSet(47512),
      batteryFastChargeEnable           : instance.readBatteryFastChargeEnable(47545),
      batteryFastChargePower            : instance.readBatteryFastChargePower(47603),
      batteryFastChargeStopStateOfCharge: instance.readBatteryFastChargeStopStateOfCharge(47546),
    })

    return instance
  })
