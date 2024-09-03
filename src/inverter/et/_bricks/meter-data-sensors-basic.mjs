import Factory from 'stampit'
import ReadMeterActivePower from '../../../_bricks/sensors/read-meter-active-power.mjs'
import ReadMeterPowerFactor from '../../../_bricks/sensors/read-meter-power-factor.mjs'


export default Factory
  .compose(
    ReadMeterActivePower,
    ReadMeterPowerFactor,
  )

  .init((param, {instance}) => {
    instance.meterData = instance.meterData || {}

    const data = {
      activePowerL1   : instance.readMeterActivePower(36019),
      activePowerL2   : instance.readMeterActivePower(36021),
      activePowerL3   : instance.readMeterActivePower(36023),
      activePowerTotal: instance.readMeterActivePower(36025),

      powerFactorL1   : instance.readMeterPowerFactor(36010),
      powerFactorL2   : instance.readMeterPowerFactor(36011),
      powerFactorL3   : instance.readMeterPowerFactor(36012),
      powerFactorTotal: instance.readMeterPowerFactor(36013),
    }

    // voltage und currents
    // exported und imported
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
