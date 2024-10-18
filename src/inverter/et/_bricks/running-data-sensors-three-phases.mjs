import Factory from 'stampit'
import ReadCurrent from '../../../_bricks/sensors/running/read-current.mjs'
import ReadFrequency from '../../../_bricks/sensors/running/read-frequency.mjs'
import ReadPower from '../../../_bricks/sensors/running/read-power.mjs'
import ReadVoltage from '../../../_bricks/sensors/running/read-voltage.mjs'
import RunningDataSensorsBasic from './running-data-sensors-basic.mjs'

export default Factory
  .compose(
    ReadCurrent,
    ReadFrequency,
    ReadPower,
    ReadVoltage,
    RunningDataSensorsBasic,
  )

  .init((param, {instance}) => {
    const data = instance.data.runningData
    Object.assign(data, {
      gridL2Voltage  : instance.readVoltage(35126),
      gridL2Current  : instance.readCurrent(35127),
      gridL2Frequency: instance.readFrequency(35128),
      gridL2Power    : instance.readPower16(35130),

      gridL3Voltage  : instance.readVoltage(35131),
      gridL3Current  : instance.readCurrent(35132),
      gridL3Frequency: instance.readFrequency(35133),
      gridL3Power    : instance.readPower16(35135),
    })

    Object.assign(data, { // virtual-fields
      gridPowerTotal: data.gridL1Power + data.gridL2Power + data.gridL3Power,
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
