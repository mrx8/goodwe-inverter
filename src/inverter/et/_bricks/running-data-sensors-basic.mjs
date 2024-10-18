import CalculateEfficiency from '../../efficiency.mjs'
import CalculatePowerTotal from './_power-total.mjs'
import Factory from 'stampit'
import ReadBatteryMode from '../../../_bricks/sensors/running/read-battery-mode.mjs'
import ReadBatteryPower from '../../../_bricks/sensors/running/read-battery-power.mjs'
import ReadCurrent from '../../../_bricks/sensors/running/read-current.mjs'
import ReadEnergyBatteryCharge from '../../../_bricks/sensors/running/read-energy-battery-charge.mjs'
import ReadEnergyBatteryDischarge from '../../../_bricks/sensors/running/read-energy-battery-discharge.mjs'
import ReadEnergyExportToday from '../../../_bricks/sensors/running/read-energy-export-today.mjs'
import ReadEnergyGenerationToday from '../../../_bricks/sensors/running/read-energy-generation-today.mjs'
import ReadEnergyGenerationTotal from '../../../_bricks/sensors/running/read-energy-generation-total.mjs'
import ReadEnergyImportToday from '../../../_bricks/sensors/running/read-energy-import-today.mjs'
import ReadErrorCodes from '../../../_bricks/sensors/running/read-error-codes.mjs'
import ReadFrequency from '../../../_bricks/sensors/running/read-frequency.mjs'
import ReadGridMode from '../../../_bricks/sensors/running/read-grid-mode.mjs'
import ReadPower from '../../../_bricks/sensors/running/read-power.mjs'
import ReadSafetyCountry from '../../../_bricks/sensors/running/read-safety-country.mjs'
import ReadTemperature from '../../../_bricks/sensors/running/read-temperature.mjs'
import ReadTimestamp from '../../../_bricks/sensors/running/read-timestamp.mjs'
import ReadVoltage from '../../../_bricks/sensors/running/read-voltage.mjs'
import ReadWorkMode from './_read-work-mode.mjs'

export default Factory
  .compose(
    ReadBatteryMode,
    ReadBatteryPower,
    ReadCurrent,
    ReadEnergyBatteryCharge,
    ReadEnergyBatteryDischarge,
    ReadEnergyGenerationToday,
    ReadEnergyExportToday,
    ReadEnergyGenerationTotal,
    ReadEnergyImportToday,
    ReadErrorCodes,
    ReadFrequency,
    ReadGridMode,
    ReadPower,
    ReadSafetyCountry,
    ReadTemperature,
    ReadTimestamp,
    ReadVoltage,
    ReadWorkMode,
    CalculatePowerTotal,
    CalculateEfficiency,
  )

  .init((param, {instance}) => {
    let data
    instance.data.runningData = data = {}

    Object.assign(data, {
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

      gridModeCode: instance.readGridModeCode(35136),
      gridMode    : instance.readGridMode(35136),

      workModeCode: instance.readWorkModeCode(35187),
      workMode    : instance.readWorkMode(35187),

      activePower       : instance.readPower16(35140),
      inverterPowerTotal: instance.readPower16(35138),

      errorCodes: instance.readErrorCodes(35189),
      errors    : instance.readErrors(35189),

      safetyCountryCode: instance.readSafetyCountryCode(35186),
      safetyCountry    : instance.readSafetyCountry(35186),

      temperatureAir   : instance.readTemperature(35174),
      temperatureModule: instance.readTemperature(35175),
      temperature      : instance.readTemperature(35176),

      batteryPower               : instance.readBatteryPower(35182),
      batteryModeCode            : instance.readBatteryModeCode(35184),
      batteryMode                : instance.readBatteryMode(35184),
      energyBatteryChargeTotal   : instance.readEnergyBatteryChargeTotal(35206),
      energyBatteryChargeToday   : instance.readEnergyBatteryChargeToday(35208),
      energyBatteryDischargeTotal: instance.readEnergyBatteryDischargeTotal(35209),
      energyBatteryDischargeToday: instance.readEnergyBatteryDischargeToday(35211),

      gridL1Voltage  : instance.readVoltage(35121),
      gridL1Current  : instance.readCurrent(35122),
      gridL1Frequency: instance.readFrequency(35123),
      gridL1Power    : instance.readPower16(35125),

      energyImportToday: instance.readEnergyImportToday(35202),
      energyExportToday: instance.readEnergyExportToday(35199),
    })

    Object.assign(data, { // virtual-fields
      pvPowerTotal: data.pv1Power + data.pv2Power + data.pv3Power + data.pv4Power,
    })

    Object.assign(data, { // virtual-fields
      gridPowerTotal: data.gridL1Power,
    })

    Object.assign(data, { // virtual-fields
      pvPowerTotal  : data.pv1Power + data.pv2Power + data.pv3Power + data.pv4Power,
      realPowerTotal: instance.calculatePowerTotal({
        pvPowerTotal      : data.pvPowerTotal,
        batteryPower      : data.batteryPower,
        inverterPowerTotal: data.inverterPowerTotal,
        gridPowerTotal    : data.gridPowerTotal,
      }),
    })

    Object.assign(data, { // virtual-fields
      efficiency: instance.calculateEfficiency({
        pvPowerTotal: data.pvPowerTotal,
        powerTotal  : data.realPowerTotal,
      }),
    })

    return instance
  })
