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

  .methods({
    parse () {
      console.log('inverter', this)
      const data = {
        timestamp: this._readTimestamp(30100),

        pv1Voltage: this._readVoltage(30103),
        pv1Current: this._readCurrent(30104),

        pv2Voltage: this._readVoltage(30105),
        pv2Current: this._readCurrent(30106),

        pv3Voltage: this._readVoltage(30107),
        pv3Current: this._readCurrent(30108),

        energyGenerationToday: this._readEnergyGenerationToday(30144),
        energyGenerationTotal: this._readEnergyGenerationTotal(30145),

        gridL1Voltage  : this._readVoltage(30118),
        gridL1Current  : this._readCurrent(30121),
        gridL1Frequency: this._readFrequency(30124),

        inverterPower: this._readInverterPower(30128),

        errorCodes: this._readErrorCodes(30130),

        safetyCountryCode : this._readSafetyCountryCode(30149),
        safetyCountryLabel: this._readSafetyCountryLabel(30149),
        temperature       : this._readTemperature(30141),
      }

      if (this.deviceInfo.numberOfPhases === 3) { // only for 3-phase models
        Object.assign(data, {
          gridL1L2Voltage: this._readVoltage(30115),
          gridL2L3Voltage: this._readVoltage(30116),
          gridL3L1Voltage: this._readVoltage(30117),

          gridL2Voltage: this._readVoltage(30119),
          gridL3Voltage: this._readVoltage(30120),

          gridL2Current: this._readCurrent(30122),
          gridL3Current: this._readCurrent(30123),

          gridL2Frequency: this._readFrequency(30125),
          gridL3Frequency: this._readFrequency(30126),
        })
      }

      Object.assign(data, { // virtual-fields
        pv1Power: Math.round(data.pv1Voltage * data.pv1Current),
        pv2Power: Math.round(data.pv2Voltage * data.pv2Current),
        pv3Power: Math.round(data.pv3Voltage * data.pv3Current),

        gridL1Power: Math.round(data.gridL1Voltage * data.gridL1Current),
      })

      if (this.deviceInfo.numberOfPhases === 3) { // only for 3-phase models
        Object.assign(data, { // virtual-fields
          gridL2Power: Math.round(data.gridL2Voltage * data.gridL2Current),
          gridL3Power: Math.round(data.gridL3Voltage * data.gridL3Current),
        })
      }

      Object.assign(data, { // virtual-fields of virtual fields
        pvPower: data.pv1Power + data.pv2Power + data.pv3Power,
      })

      return data
    },
  })
