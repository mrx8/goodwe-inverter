import Factory from 'stampit'
import ReadCurrent from '../../../_bricks/sensors/read-current.mjs'
import ReadEnergyGenerationToday from '../../../_bricks/sensors/read-energy-generation-today.mjs'
import ReadEnergyGenerationTotal from '../../../_bricks/sensors/read-energy-generation-total.mjs'
import ReadErrorCodes from '../../../_bricks/sensors/read-error-codes.mjs'
import ReadFrequency from '../../../_bricks/sensors/read-frequency.mjs'
import ReadInverterPowerTotal from '../../../_bricks/sensors/read-inverter-power-total.mjs'
import ReadSafetyCountry from '../../../_bricks/sensors/read-safety-country.mjs'
import ReadTemperature from '../../../_bricks/sensors/read-temperature.mjs'
import ReadTimestamp from '../../../_bricks/sensors/read-timestamp.mjs'
import ReadVoltage from '../../../_bricks/sensors/read-voltage.mjs'


export default Factory
  .compose(
    ReadCurrent,
    ReadEnergyGenerationToday,
    ReadEnergyGenerationTotal,
    ReadErrorCodes,
    ReadFrequency,
    ReadInverterPowerTotal,
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

      energyGenerationToday: instance.readEnergyGenerationToday(30144),
      energyGenerationTotal: instance.readEnergyGenerationTotal(30145),

      gridL1Voltage  : instance.readVoltage(30118),
      gridL1Current  : instance.readCurrent(30121),
      gridL1Frequency: instance.readFrequency(30124),

      inverterPowerTotal: instance.readInverterPowerTotal(30128),

      errorCodes: instance.readErrorCodes(30130),
      errors    : instance.readErrors(30130),

      safetyCountryCode: instance.readSafetyCountryCode(30149),
      safetyCountry    : instance.readSafetyCountry(30149),
      temperature      : instance.readTemperature(30141),
    }

    Object.assign(data, { // virtual-fields
      pv1Power: Math.round(data.pv1Voltage * data.pv1Current),
      pv2Power: Math.round(data.pv2Voltage * data.pv2Current),
      pv3Power: Math.round(data.pv3Voltage * data.pv3Current),

      gridL1Power: Math.round(data.gridL1Voltage * data.gridL1Current),
    })

    Object.assign(data, { // virtual-fields
      pvPower: data.pv1Power + data.pv2Power + data.pv3Power,
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
