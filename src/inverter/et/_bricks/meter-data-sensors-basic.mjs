import Factory from 'stampit'
import ReadEnergyTotal from '../../../_bricks/sensors/meter/read-energy-total.mjs'
import ReadFrequency from '../../../_bricks/sensors/meter/read-frequency.mjs'
import ReadPower from '../../../_bricks/sensors/meter/read-power.mjs'
import ReadPowerFactor from '../../../_bricks/sensors/meter/read-power-factor.mjs'

export default Factory
  .compose(
    ReadEnergyTotal,
    ReadFrequency,
    ReadPower,
    ReadPowerFactor,
  )

  .init((param, {instance}) => {
    instance.meterData = instance.meterData || {}

    const data = {
      activePowerL1   : instance.readPower(36019),
      activePowerL2   : instance.readPower(36021),
      activePowerL3   : instance.readPower(36023),
      activePowerTotal: instance.readPower(36025),

      reactivePowerL1   : instance.readPower(36027),
      reactivePowerL2   : instance.readPower(36029),
      reactivePowerL3   : instance.readPower(36031),
      reactivePowerTotal: instance.readPower(36033),

      apparentPowerL1   : instance.readPower(36035),
      apparentPowerL2   : instance.readPower(36037),
      apparentPowerL3   : instance.readPower(36039),
      apparentPowerTotal: instance.readPower(36041),

      powerFactorL1   : instance.readPowerFactor(36010),
      powerFactorL2   : instance.readPowerFactor(36011),
      powerFactorL3   : instance.readPowerFactor(36012),
      powerFactorTotal: instance.readPowerFactor(36013),

      frequency: instance.readFrequency(36014),

      energyExportedTotal: instance.readEnergyTotal(36015),
      energyImportedTotal: instance.readEnergyTotal(36017),
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
