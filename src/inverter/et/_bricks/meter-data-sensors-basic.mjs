import Factory from 'stampit'
import ReadMeterEnergyTotal from '../../../_bricks/sensors/read-meter-energy-total.mjs'
import ReadMeterFrequency from '../../../_bricks/sensors/read-meter-frequency.mjs'
import ReadMeterPower from '../../../_bricks/sensors/read-meter-power.mjs'
import ReadMeterPowerFactor from '../../../_bricks/sensors/read-meter-power-factor.mjs'

export default Factory
  .compose(
    ReadMeterEnergyTotal,
    ReadMeterFrequency,
    ReadMeterPower,
    ReadMeterPowerFactor,
  )

  .init((param, {instance}) => {
    instance.meterData = instance.meterData || {}

    const data = {
      activePowerL1   : instance.readMeterPower(36019),
      activePowerL2   : instance.readMeterPower(36021),
      activePowerL3   : instance.readMeterPower(36023),
      activePowerTotal: instance.readMeterPower(36025),

      reactivePowerL1   : instance.readMeterPower(36027),
      reactivePowerL2   : instance.readMeterPower(36029),
      reactivePowerL3   : instance.readMeterPower(36031),
      reactivePowerTotal: instance.readMeterPower(36033),

      apparentPowerL1   : instance.readMeterPower(36035),
      apparentPowerL2   : instance.readMeterPower(36037),
      apparentPowerL3   : instance.readMeterPower(36039),
      apparentPowerTotal: instance.readMeterPower(36041),

      powerFactorL1   : instance.readMeterPowerFactor(36010),
      powerFactorL2   : instance.readMeterPowerFactor(36011),
      powerFactorL3   : instance.readMeterPowerFactor(36012),
      powerFactorTotal: instance.readMeterPowerFactor(36013),

      frequency: instance.readMeterFrequency(36014),

      energyExportedTotal: instance.readMeterEnergyTotal(36015),
      energyImportedTotal: instance.readMeterEnergyTotal(36017),
    }

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
