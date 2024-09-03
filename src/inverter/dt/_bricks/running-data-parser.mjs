import Factory from 'stampit'
import ReadCurrent from '../../_bricks/read-current.mjs'
import ReadEnergyGenerationToday from '../../_bricks/read-energy-generation-today.mjs'
import ReadEnergyGenerationTotal from '../../_bricks/read-energy-generation-total.mjs'
import ReadErrorCodes from '../../_bricks/read-error-codes.mjs'
import ReadFrequency from '../../_bricks/read-frequency.mjs'
import ReadInverterPowerTotal from '../../_bricks/read-inverter-power-total.mjs'
import ReadSafetyCountry from '../../_bricks/read-safety-country.mjs'
import ReadTemperature from '../../_bricks/read-temperature.mjs'
import ReadTimestamp from '../../_bricks/read-timestamp.mjs'
import ReadVoltage from '../../_bricks/read-voltage.mjs'


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

  .init(({deviceInfo}, {instance}) => {
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

    if (deviceInfo.numberOfPhases === 3) { // only for 3-phase models
      Object.assign(data, {
        gridL1L2Voltage: instance.readVoltage(30115),
        gridL2L3Voltage: instance.readVoltage(30116),
        gridL3L1Voltage: instance.readVoltage(30117),

        gridL2Voltage: instance.readVoltage(30119),
        gridL3Voltage: instance.readVoltage(30120),

        gridL2Current: instance.readCurrent(30122),
        gridL3Current: instance.readCurrent(30123),

        gridL2Frequency: instance.readFrequency(30125),
        gridL3Frequency: instance.readFrequency(30126),
      })
    }

    Object.assign(data, { // virtual-fields
      pv1Power: Math.round(data.pv1Voltage * data.pv1Current),
      pv2Power: Math.round(data.pv2Voltage * data.pv2Current),
      pv3Power: Math.round(data.pv3Voltage * data.pv3Current),

      gridL1Power: Math.round(data.gridL1Voltage * data.gridL1Current),
    })

    if (deviceInfo.numberOfPhases === 3) { // only for 3-phase models
      Object.assign(data, { // virtual-fields
        gridL2Power: Math.round(data.gridL2Voltage * data.gridL2Current),
        gridL3Power: Math.round(data.gridL3Voltage * data.gridL3Current),
      })
    }

    Object.assign(data, { // virtual-fields of virtual fields
      pvPower: data.pv1Power + data.pv2Power + data.pv3Power,
    })

    return data
  })
