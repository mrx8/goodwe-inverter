import Factory from 'stampit'
import ReadBatteryMinimumStateOfChargeOnGrid from '../../../_bricks/sensors/settings/read-battery-minimum-state-of-charge-on-grid.mjs'

export default Factory
  .compose(
    ReadBatteryMinimumStateOfChargeOnGrid,
  )

  .init((param, {instance}) => {
    instance.data.settingsData = instance.data.settingsData || {}

    Object.assign(instance.data.settingsData, {
      batteryMinimumStateOfChargeOnGrid: instance.readBatteryMinimumStateOfChargeOnGrid(45356),
    })

    return instance
  })
