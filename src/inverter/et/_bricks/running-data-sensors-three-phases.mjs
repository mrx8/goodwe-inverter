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
    Object.assign(instance.runningData, {
      gridL2Voltage  : instance.readVoltage(35126),
      gridL2Current  : instance.readCurrent(35127),
      gridL2Frequency: instance.readFrequency(35128),
      gridL2Power    : instance.readPower16(35130),

      gridL3Voltage  : instance.readVoltage(35131),
      gridL3Current  : instance.readCurrent(35132),
      gridL3Frequency: instance.readFrequency(35133),
      gridL3Power    : instance.readPower16(35135),
    })

    Object.assign(instance.runningData, { // virtual-fields
      gridPowerTotal: instance.runningData.gridL1Power + instance.runningData.gridL2Power + instance.runningData.gridL3Power,
    })

    Object.assign(instance.runningData, { // virtual-fields
      pvPowerTotal: instance.runningData.pv1Power + instance.runningData.pv2Power + instance.runningData.pv3Power + instance.runningData.pv4Power,
      powerTotal  : instance.calculatePowerTotal({
        pvPowerTotal      : instance.runningData.pvPowerTotal,
        batteryPower      : instance.runningData.batteryPower,
        inverterPowerTotal: instance.runningData.inverterPowerTotal,
        gridPowerTotal    : instance.runningData.gridPowerTotal,
      }),
    })

    Object.assign(instance.runningData, { // virtual-fields
      efficiency: instance.calculateEfficiency({
        pvPowerTotal: instance.runningData.pvPowerTotal,
        powerTotal  : instance.runningData.powerTotal,
      }),
    })

    return instance
  })
