import CalculatePowerTotal from './_power-total.mjs'
import Factory from 'stampit'
import ReadCurrent from '../../../_bricks/sensors/running/read-current.mjs'
import ReadFrequency from '../../../_bricks/sensors/running/read-frequency.mjs'
import ReadVoltage from '../../../_bricks/sensors/running/read-voltage.mjs'
import RunningDataSensorsBasic from './running-data-sensors-basic.mjs'

export default Factory
  .compose(
    CalculatePowerTotal,
    ReadCurrent,
    ReadFrequency,
    ReadVoltage,
    RunningDataSensorsBasic,
  )

  .init((param, {instance}) => {
    let data
    instance.data.runningData = data = instance.data.runningData || {}

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

    Object.assign(data, { // virtual-fields
      gridL2Power: data.gridL2Voltage * data.gridL2Current,
      gridL3Power: data.gridL3Voltage * data.gridL3Current,
    })

    Object.assign(data, { // virtual-fields of virtual-fields
      gridPowerTotal: data.gridL1Power + data.gridL2Power + data.gridL3Power,
    })

    Object.assign(data, { // virtual-fields
      realPowerTotal: instance.calculatePowerTotal({
        powerTotal  : data.powerTotal,
        pvPowerTotal: data.pvPowerTotal,
        workModeCode: data.workModeCode,
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
