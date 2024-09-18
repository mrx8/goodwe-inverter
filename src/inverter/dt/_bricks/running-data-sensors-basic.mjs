import Factory from 'stampit'
import ReadCurrent from '../../../_bricks/sensors/running/read-current.mjs'
import ReadEnergyGenerationToday from '../../../_bricks/sensors/running/read-energy-generation-today.mjs'
import ReadEnergyGenerationTotal from '../../../_bricks/sensors/running/read-energy-generation-total.mjs'
import ReadErrorCodes from '../../../_bricks/sensors/running/read-error-codes.mjs'
import ReadFrequency from '../../../_bricks/sensors/running/read-frequency.mjs'
import ReadPower from '../../../_bricks/sensors/running/read-power.mjs'
import ReadSafetyCountry from '../../../_bricks/sensors/running/read-safety-country.mjs'
import ReadTemperature from '../../../_bricks/sensors/running/read-temperature.mjs'
import ReadTimestamp from '../../../_bricks/sensors/running/read-timestamp.mjs'
import ReadVoltage from '../../../_bricks/sensors/running/read-voltage.mjs'


export default Factory
  .compose(
    ReadCurrent,
    ReadEnergyGenerationToday,
    ReadEnergyGenerationTotal,
    ReadErrorCodes,
    ReadFrequency,
    ReadPower,
    ReadSafetyCountry,
    ReadTemperature,
    ReadTimestamp,
    ReadVoltage,
  )

  .init((param, {instance}) => {
    instance.runningData = {}

    Object.assign(instance.runningData, {
      timestamp: instance.readTimestamp(30100),

      pv1Voltage: instance.readVoltage(30103),
      pv1Current: instance.readCurrent(30104),

      pv2Voltage: instance.readVoltage(30105),
      pv2Current: instance.readCurrent(30106),

      pv3Voltage: instance.readVoltage(30107),
      pv3Current: instance.readCurrent(30108),

      pvEnergyGenerationToday: instance.readEnergyGenerationToday(30144),
      pvEnergyGenerationTotal: instance.readEnergyGenerationTotal(30145),

      gridL1Voltage  : instance.readVoltage(30118),
      gridL1Current  : instance.readCurrent(30121),
      gridL1Frequency: instance.readFrequency(30124),

      activePower: instance.readPower16(30128), // only for completeness
      powerTotal : instance.readPower16(30128),

      errorCodes: instance.readErrorCodes(30130),
      errors    : instance.readErrors(30130),

      safetyCountryCode: instance.readSafetyCountryCode(30149),
      safetyCountry    : instance.readSafetyCountry(30149),

      temperature: instance.readTemperature(30141),
    })

    Object.assign(instance.runningData, { // virtual-fields
      pv1Power: instance.runningData.pv1Voltage * instance.runningData.pv1Current,
      pv2Power: instance.runningData.pv2Voltage * instance.runningData.pv2Current,
      pv3Power: instance.runningData.pv3Voltage * instance.runningData.pv3Current,

      gridL1Power: instance.runningData.gridL1Voltage * instance.runningData.gridL1Current,
    })

    Object.assign(instance.runningData, { // virtual-fields
      pvPowerTotal  : instance.runningData.pv1Power + instance.runningData.pv2Power + instance.runningData.pv3Power,
      gridPowerTotal: instance.runningData.gridL1Power,
    })

    let efficiency = null
    if (instance.runningData.pvPowerTotal > 0) {
      efficiency = Number(
        instance.runningData.powerTotal * 100 / instance.runningData.pvPowerTotal,
      ).toFixed(2)
    }
    if (efficiency !== null) {
      Object.assign(instance.runningData, { // virtual-fields
        efficiency,
      })
    }

    return instance
  })

  .methods({
    getData () {
      return {
        runningData: this.runningData,
      }
    },
  })
