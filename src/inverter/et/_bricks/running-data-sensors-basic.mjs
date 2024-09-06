import Factory from 'stampit'
import ReadBatteryMode from '../../../_bricks/sensors/read-battery-mode.mjs'
import ReadBatteryPower from '../../../_bricks/sensors/read-battery-power.mjs'
import ReadCurrent from '../../../_bricks/sensors/read-current.mjs'
import ReadEnergyBatteryChargeToday from '../../../_bricks/sensors/read-energy-battery-charge-today.mjs'
import ReadEnergyBatteryDischargeToday from '../../../_bricks/sensors/read-energy-battery-discharge-today.mjs'
import ReadEnergyGenerationToday from '../../../_bricks/sensors/read-energy-generation-today.mjs'
import ReadEnergyGenerationTotal from '../../../_bricks/sensors/read-energy-generation-total.mjs'
import ReadErrorCodes from '../../../_bricks/sensors/read-error-codes.mjs'
import ReadFrequency from '../../../_bricks/sensors/read-frequency.mjs'
import ReadGridMode from '../../../_bricks/sensors/read-grid-mode.mjs'
import ReadInverterActivePower from '../../../_bricks/sensors/read-inverter-active-power.mjs'
import ReadInverterEnergyExportToday from '../../../_bricks/sensors/read-inverter-energy-export-today.mjs'
import ReadInverterEnergyImportToday from '../../../_bricks/sensors/read-inverter-energy-import-today.mjs'
import ReadInverterPowerTotal from '../../../_bricks/sensors/read-inverter-power-total.mjs'
import ReadPower from '../../../_bricks/sensors/read-power.mjs'
import ReadSafetyCountry from '../../../_bricks/sensors/read-safety-country.mjs'
import ReadTemperature from '../../../_bricks/sensors/read-temperature.mjs'
import ReadTimestamp from '../../../_bricks/sensors/read-timestamp.mjs'
import ReadVoltage from '../../../_bricks/sensors/read-voltage.mjs'

export default Factory
  .compose(
    ReadBatteryMode,
    ReadBatteryPower,
    ReadCurrent,
    ReadEnergyBatteryChargeToday,
    ReadEnergyGenerationToday,
    ReadEnergyBatteryDischargeToday,
    ReadEnergyGenerationTotal,
    ReadErrorCodes,
    ReadFrequency,
    ReadGridMode,
    ReadInverterActivePower,
    ReadInverterEnergyExportToday,
    ReadInverterEnergyImportToday,
    ReadInverterPowerTotal,
    ReadPower,
    ReadSafetyCountry,
    ReadTemperature,
    ReadTimestamp,
    ReadVoltage,
  )

  .init((param, {instance}) => {
    instance.runningData = instance.runningData || {}

    const data = {
      timestamp: instance.readTimestamp(35100),

      pv1Voltage: instance.readVoltage(35103),
      pv1Current: instance.readCurrent(35104),
      pv1Power  : instance.readPower(35105),

      pv2Voltage: instance.readVoltage(35107),
      pv2Current: instance.readCurrent(35108),
      pv2Power  : instance.readPower(35109),

      pv3Voltage: instance.readVoltage(35111),
      pv3Current: instance.readCurrent(35112),
      pv3Power  : instance.readPower(35113),

      pv4Voltage: instance.readVoltage(35115),
      pv4Current: instance.readCurrent(35116),
      pv4Power  : instance.readPower(35117),

      pvEnergyGenerationToday: instance.readEnergyGenerationToday32(35193),
      pvEnergyGenerationTotal: instance.readEnergyGenerationTotal(35191),

      gridModeCode: instance.readGridModeCode(35140),
      gridMode    : instance.readGridMode(35140),

      inverterActivePower: instance.readInverterActivePower(35140),
      inverterPowerTotal : instance.readInverterPowerTotal(35138),

      errorCodes: instance.readErrorCodes(35189),
      errors    : instance.readErrors(35189),

      safetyCountryCode: instance.readSafetyCountryCode(35186),
      safetyCountry    : instance.readSafetyCountry(35186),
      temperatureAir   : instance.readTemperature(35174),
      temperature      : instance.readTemperature(35176),

      batteryPower               : instance.readBatteryPower(35182),
      batteryModeCode            : instance.readBatteryModeCode(35184),
      batteryMode                : instance.readBatteryMode(35184),
      energyBatteryChargeToday   : instance.readEnergyBatteryChargeToday(35208),
      energyBatteryDischargeToday: instance.readEnergyBatteryDischargeToday(35211),

      gridL1Voltage  : instance.readVoltage(35121),
      gridL1Current  : instance.readCurrent(35122),
      gridL1Frequency: instance.readFrequency(35123),
      gridL1Power    : instance.readInverterPower(35125),

      energyBatteryImportToday: instance.readInverterEnergyImportToday(35202),
      energyBatteryExportToday: instance.readInverterEnergyExportToday(35199),
    }
    Object.assign(instance.runningData, data)

    Object.assign(instance.runningData, { // virtual-fields
      pvPowerTotal    : data.pv1Power + data.pv2Power + data.pv3Power + data.pv4Power,
      houseConsumption: data.pv1Power + data.pv2Power + data.pv3Power + data.pv4Power + data.batteryPower - data.inverterActivePower,
    })

    return instance
  })

  .methods({
    getData () {
      return {
        runningData: this.runningData,
      }
    },
  })
