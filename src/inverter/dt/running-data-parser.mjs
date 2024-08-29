import Factory from 'stampit'
import ReadCurrent from '../../bricks/read-current.mjs'
import ReadEnergyGenerationToday from '../../bricks/read-energy-generation-today.mjs'
import ReadEnergyGenerationTotal from '../../bricks/read-energy-generation-total.mjs'
import ReadErrorCodes from '../../bricks/read-error-codes.mjs'
import ReadFrequency from '../../bricks/read-frequency.mjs'
import ReadInverterPower from '../../bricks/read-inverter-power.mjs'
import ReadSafetyCountry from '../../bricks/read-safety-country.mjs'
import ReadTemperature from '../../bricks/read-temperature.mjs'
import ReadTimestamp from '../../bricks/read-timestamp.mjs'
import ReadVoltage from '../../bricks/read-voltage.mjs'


export default Factory
  .compose(
    ReadCurrent,
    ReadEnergyGenerationToday,
    ReadEnergyGenerationTotal,
    ReadErrorCodes,
    ReadFrequency,
    ReadInverterPower,
    ReadSafetyCountry,
    ReadTemperature,
    ReadTimestamp,
    ReadVoltage,
  )

  .init(({deviceInfo}, {instance}) => {
    const data = {
      timestamp: instance._readTimestamp(30100),

      pv1Voltage: instance._readVoltage(30103),
      pv1Current: instance._readCurrent(30104),

      pv2Voltage: instance._readVoltage(30105),
      pv2Current: instance._readCurrent(30106),

      pv3Voltage: instance._readVoltage(30107),
      pv3Current: instance._readCurrent(30108),

      energyGenerationToday: instance._readEnergyGenerationToday(30144),
      energyGenerationTotal: instance._readEnergyGenerationTotal(30145),

      gridL1Voltage  : instance._readVoltage(30118),
      gridL1Current  : instance._readCurrent(30121),
      gridL1Frequency: instance._readFrequency(30124),

      inverterPower: instance._readInverterPower(30128),

      errorCodes: instance._readErrorCodes(30130),

      safetyCountryCode : instance._readSafetyCountryCode(30149),
      safetyCountryLabel: instance._readSafetyCountryLabel(30149),
      temperature       : instance._readTemperature(30141),
    }

    if (deviceInfo.numberOfPhases === 3) { // only for 3-phase models
      Object.assign(data, {
        gridL1L2Voltage: instance._readVoltage(30115),
        gridL2L3Voltage: instance._readVoltage(30116),
        gridL3L1Voltage: instance._readVoltage(30117),

        gridL2Voltage: instance._readVoltage(30119),
        gridL3Voltage: instance._readVoltage(30120),

        gridL2Current: instance._readCurrent(30122),
        gridL3Current: instance._readCurrent(30123),

        gridL2Frequency: instance._readFrequency(30125),
        gridL3Frequency: instance._readFrequency(30126),
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
