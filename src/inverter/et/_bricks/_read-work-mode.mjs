import Factory from 'stampit'
import GetStamp from '../../../shared/get-stamp.mjs'
import ReadUInt16BE from '../../../_bricks/sensors/read-uint16be.mjs'


export default Factory
  .compose(
    GetStamp,
    ReadUInt16BE,
  )

  .configuration({
    WORK_MODES_ET: {
      0: 'Wait Mode',
      1: 'Normal (On-Grid)',
      2: 'Normal (Off-Grid)',
      3: 'Fault Mode',
      4: 'Flash Mode',
      5: 'Check Mode',
    },
  })

  .methods({
    readWorkModeCode (register) {
      return this.readUInt16BE(register)
    },

    readWorkMode (register) {
      const value = this.readWorkModeCode(register)

      return this.getStampConfiguration().WORK_MODES_ET[value] || 'unknown'
    },
  })
