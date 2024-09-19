import CalculateEfficiency from '../../efficiency.mjs'
import CalculatePowerTotal from './power-total.mjs'
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
import ReadWorkMode from './read-work-mode.mjs'


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
    ReadWorkMode,
    CalculatePowerTotal,
    CalculateEfficiency,
  )

  .init((param, {instance}) => {
    let data
    instance.runningData = data = {}

    Object.assign(data, {
      timestamp: instance.readTimestamp(30100),

      pv1Voltage: instance.readVoltage(30103),
      pv1Current: instance.readCurrent(30104),

      pv2Voltage: instance.readVoltage(30105),
      pv2Current: instance.readCurrent(30106),

      pv3Voltage: instance.readVoltage(30107),
      pv3Current: instance.readCurrent(30108),

      pvEnergyGenerationToday: instance.readEnergyGenerationToday(30144),
      pvEnergyGenerationTotal: instance.readEnergyGenerationTotal(30145),

      workModeCode: instance.readWorkModeCode(30129),
      workMode    : instance.readWorkMode(30129),

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

    Object.assign(data, { // virtual-fields
      pv1Power: data.pv1Voltage * data.pv1Current,
      pv2Power: data.pv2Voltage * data.pv2Current,
      pv3Power: data.pv3Voltage * data.pv3Current,

      gridL1Power: data.gridL1Voltage * data.gridL1Current,
    })

    Object.assign(data, { // virtual-fields
      pvPowerTotal  : data.pv1Power + data.pv2Power + data.pv3Power,
      gridPowerTotal: data.gridL1Power,
    })

    Object.assign(data, { // virtual-fields
      powerTotal: instance.calculatePowerTotal({
        powerTotal    : data.powerTotal,
        gridPowerTotal: data.gridPowerTotal,
        pvPowerTotal  : data.pvPowerTotal,
      }),
    })

    Object.assign(data, { // virtual-fields
      efficiency: instance.calculateEfficiency({
        pvPowerTotal: data.pvPowerTotal,
        powerTotal  : data.powerTotal,
      }),
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
