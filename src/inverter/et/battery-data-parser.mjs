import Factory from 'stampit'
import ReadBatterySoc from '../../bricks/read-battery-soc.mjs'


export default Factory
  .compose(
    ReadBatterySoc,
  )

  .init((param, {instance}) => {
    const data = {
      batteryStateOfCharge: instance._readBatteryStateOfCharge(37007),
    }

    return data
  })
