import Factory from 'stampit'
import ReadCurrent from '../../../_bricks/sensors/running/read-current.mjs'
import ReadEnergyGenerationToday from '../../../_bricks/sensors/running/read-energy-generation-today.mjs'
import ReadEnergyGenerationTotal from '../../../_bricks/sensors/running/read-energy-generation-total.mjs'
import ReadErrorCodes from '../../../_bricks/sensors/running/read-error-codes.mjs'
import ReadFrequency from '../../../_bricks/sensors/running/read-frequency.mjs'
import ReadPowerFactor from '../../../_bricks/sensors/running/read-power-factor.mjs'
import ReadPowerTotal from '../../../_bricks/sensors/running/read-power-total.mjs'
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
    ReadPowerFactor,
    ReadPowerTotal,
    ReadSafetyCountry,
    ReadTemperature,
    ReadTimestamp,
    ReadVoltage,
  )

  .init((param, {instance}) => {
    instance.runningData = instance.runningData || {}

    const data = {
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

      activePower: instance.readPowerTotal(30128), // only for completeness
      powerTotal : instance.readPowerTotal(30128),

      errorCodes: instance.readErrorCodes(30130),
      errors    : instance.readErrors(30130),

      powerFactor: instance.readPowerFactor(30139),

      safetyCountryCode: instance.readSafetyCountryCode(30149),
      safetyCountry    : instance.readSafetyCountry(30149),

      temperature: instance.readTemperature(30141),
    }

    Object.assign(data, { // virtual-fields
      pv1Power: Math.round(data.pv1Voltage * data.pv1Current),
      pv2Power: Math.round(data.pv2Voltage * data.pv2Current),
      pv3Power: Math.round(data.pv3Voltage * data.pv3Current),

      gridL1Power: Math.round(data.gridL1Voltage * data.gridL1Current),
    })

    Object.assign(data, { // virtual-fields
      pvPowerTotal: data.pv1Power + data.pv2Power + data.pv3Power,
    })

    Object.assign(instance.runningData, data)

    return instance
  })

  .methods({
    getData () {
      return {
        runningData: this.runningData,
      }
    },
  })
