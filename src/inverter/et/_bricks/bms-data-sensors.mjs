import Factory from 'stampit'
import ReadCurrentLimit from '../../../_bricks/sensors/bms/read-current-limit.mjs'
import ReadError from '../../../_bricks/sensors/bms/read-error.mjs'
import ReadNumberOfModules from '../../../_bricks/sensors/bms/read-number-of-modules.mjs'
import ReadStateOfCharge from '../../../_bricks/sensors/bms/read-state-of-charge.mjs'
import ReadStateOfHealth from '../../../_bricks/sensors/bms/read-state-of-health.mjs'
import ReadTemperature from '../../../_bricks/sensors/bms/read-temperature.mjs'

export default Factory
  .compose(
    ReadCurrentLimit,
    ReadError,
    ReadNumberOfModules,
    ReadStateOfCharge,
    ReadStateOfHealth,
    ReadTemperature,
  )

  .init((param, {instance}) => {
    instance.bmsData = {}

    Object.assign(instance.bmsData, {
      stateOfCharge        : instance.readStateOfCharge(37007),
      stateOfHealth        : instance.readStateOfHealth(37008),
      temperature          : instance.readTemperature(37003),
      numberOfmodules      : instance.readNumberOfModules(37009),
      chargeCurrentLimit   : instance.readChargeCurrentLimit(37004),
      dischargeCurrentLimit: instance.readDischargeCurrentLimit(37005),
      errorCodeHigh        : instance.readErrorCodeHigh(37012),
      errorCodeLow         : instance.readErrorCodeLow(37006),
      error                : instance.readError(37012, 37006),
    })

    return instance
  })

  .methods({
    getData () {
      return {
        bmsData: this.bmsData,
      }
    },
  })
