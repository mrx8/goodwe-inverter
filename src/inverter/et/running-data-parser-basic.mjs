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
import ReadGridMode from '../../bricks/read-grid-mode.mjs'
import ReadInverterActivePower from '../../bricks/read-inverter-active-power.mjs'
import ReadInverterPowerTotal from '../../bricks/read-inverter-power-total.mjs'
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
    ReadGridMode,
    ReadInverterActivePower,
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

      energyGenerationToday: instance.readEnergyGenerationToday32(35193),
      energyGenerationTotal: instance.readEnergyGenerationTotal(35191),

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
    }
    Object.assign(instance.runningData, data)

    Object.assign(instance.runningData, { // virtual-fields
      pvPower         : data.pv1Power + data.pv2Power + data.pv3Power + data.pv4Power,
      houseConsumption: data.pv1Power + data.pv2Power + data.pv3Power + data.pv4Power + data.batteryPower - data.inverterActivePower,
    })

    return instance
  })
