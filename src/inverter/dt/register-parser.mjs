import Factory from 'stampit'
import ReadCurrent from '../../bricks/read-current.mjs'
import ReadTimestamp from '../../bricks/read-timestamp.mjs'
import ReadVoltage from '../../bricks/read-voltage.mjs'


export default Factory
  .compose(
    ReadTimestamp,
    ReadVoltage,
    ReadCurrent,
  )

  .methods({
    parse () {
      const data = {
        timestamp : this._readTimestamp(30100),
        pv1Voltage: this._readVoltage(30103),
        pv1Current: this._readCurrent(30104),
      }

      Object.assign(data, {
        pv1Power: Math.round(data.pv1Voltage * data.pv1Current),
      })

      return data
    },
  })
