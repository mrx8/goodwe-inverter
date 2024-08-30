import Factory from 'stampit'
import ReadBatteryMode from '../../bricks/read-battery-mode.mjs'
import ReadBatteryPower from '../../bricks/read-battery-power.mjs'
import ReadCurrent from '../../bricks/read-current.mjs'
import ReadEnergyBatteryChargeToday from '../../bricks/read-energy-battery-charge-today.mjs'
import ReadEnergyBatteryDischargeToday from '../../bricks/read-energy-battery-discharge-today.mjs'
import ReadEnergyGenerationToday from '../../bricks/read-energy-generation-today.mjs'
import ReadEnergyGenerationToday32 from '../../bricks/read-energy-generation-today32.mjs'
import ReadEnergyGenerationTotal from '../../bricks/read-energy-generation-total.mjs'
import ReadErrorCodes from '../../bricks/read-error-codes.mjs'
import ReadFrequency from '../../bricks/read-frequency.mjs'
import ReadInverterActivePower from '../../bricks/read-inverter-active-power.mjs'
import ReadInverterPower from '../../bricks/read-inverter-power.mjs'
import ReadPower from '../../bricks/read-power.mjs'
import ReadSafetyCountry from '../../bricks/read-safety-country.mjs'
import ReadTemperature from '../../bricks/read-temperature.mjs'
import ReadTimestamp from '../../bricks/read-timestamp.mjs'
import ReadVoltage from '../../bricks/read-voltage.mjs'

export default Factory
  .compose(
    ReadBatteryMode,
    ReadBatteryPower,
    ReadCurrent,
    ReadEnergyBatteryChargeToday,
    ReadEnergyGenerationToday,
    ReadEnergyBatteryDischargeToday,
    ReadEnergyGenerationToday32,
    ReadEnergyGenerationTotal,
    ReadErrorCodes,
    ReadFrequency,
    ReadInverterActivePower,
    ReadInverterPower,
    ReadPower,
    ReadSafetyCountry,
    ReadTemperature,
    ReadTimestamp,
    ReadVoltage,
  )

  .init(({deviceInfo}, {instance}) => {
    const data = {
      timestamp: instance._readTimestamp(35100),

      pv1Voltage: instance._readVoltage(35103),
      pv1Current: instance._readCurrent(35104),
      pv1Power  : instance._readPower(35105),

      pv2Voltage: instance._readVoltage(35107),
      pv2Current: instance._readCurrent(35108),
      pv2Power  : instance._readPower(35109),

      pv3Voltage: instance._readVoltage(35111),
      pv3Current: instance._readCurrent(35112),
      pv3Power  : instance._readPower(35113),

      pv4Voltage: instance._readVoltage(35115),
      pv4Current: instance._readCurrent(35116),
      pv4Power  : instance._readPower(35117),

      energyGenerationToday: instance._readEnergyGenerationToday32(35193),
      energyGenerationTotal: instance._readEnergyGenerationTotal(35191),

      // gridL1Voltage  : instance._readVoltage(30118),
      // gridL1Current  : instance._readCurrent(30121),
      // gridL1Frequency: instance._readFrequency(30124),

      inverterActivePower: instance._readInverterActivePower(35140),
      inverterPower      : instance._readInverterPower(35138),

      // errorCodes: instance._readErrorCodes(30130),

      safetyCountryCode: instance._readSafetyCountryCode(35186),
      safetyCountry    : instance._readSafetyCountry(35186),
      temperatureAir   : instance._readTemperature(35174),
      temperature      : instance._readTemperature(35176),

      batteryPower               : instance._readBatteryPower(35182),
      batteryModeCode            : instance._readBatteryModeCode(35184),
      batteryMode                : instance._readBatteryMode(35184),
      energyBatteryChargeToday   : instance._readEnergyBatteryChargeToday(35208),
      energyBatteryDischargeToday: instance._readEnergyBatteryDischargeToday(35211),
    }

    if (deviceInfo.numberOfPhases === 3) { // only for 3-phase models
      Object.assign(data, {
        // gridL1L2Voltage: instance._readVoltage(30115),
        // gridL2L3Voltage: instance._readVoltage(30116),
        // gridL3L1Voltage: instance._readVoltage(30117),

        // gridL2Voltage: instance._readVoltage(30119),
        // gridL3Voltage: instance._readVoltage(30120),

        // gridL2Current: instance._readCurrent(30122),
        // gridL3Current: instance._readCurrent(30123),

        // gridL2Frequency: instance._readFrequency(30125),
        // gridL3Frequency: instance._readFrequency(30126),
      })
    }

    Object.assign(data, { // virtual-fields
      // gridL1Power: Math.round(data.gridL1Voltage * data.gridL1Current),
      houseConsumption: data.pv1Power + data.pv2Power + data.pv3Power + data.pv4Power + data.batteryPower - data.inverterActivePower,
    })

    if (deviceInfo.numberOfPhases === 3) { // only for 3-phase models
      Object.assign(data, { // virtual-fields
        // gridL2Power: Math.round(data.gridL2Voltage * data.gridL2Current),
        // gridL3Power: Math.round(data.gridL3Voltage * data.gridL3Current),
      })
    }

    Object.assign(data, { // virtual-fields of virtual fields
      pvPower: data.pv1Power + data.pv2Power + data.pv3Power + data.pv4Power,
    })

    return data
  })
