import Factory from 'stampit'
import ReadMeterActivePower from '../../bricks/read-meter-active-power.mjs'

export default Factory
  .compose(
    ReadMeterActivePower,
  )

  .init((param, {instance}) => {
    console.log('INSTANCE', instance)
    const data = {
      meterActivePowerL1   : instance.readMeterActivePower(36019),
      meterActivePowerL2   : instance.readMeterActivePower(36021),
      meterActivePowerL3   : instance.readMeterActivePower(36023),
      meterActivePowerTotal: instance.readMeterActivePower(36025),
    }

    // power factors
    // voltage und currents
    // exported und imported
    return data
  })
