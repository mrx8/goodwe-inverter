import Factory from 'stampit'
import GetStamp from '../../../shared/get-stamp.mjs'
import ReadUInt16BE from '../../../_bricks/sensors/read-uint16be.mjs'


export default Factory
  .compose(
    GetStamp,
    ReadUInt16BE,
  )

  .configuration({
    WORK_MODES: {
      0: 'Wait Mode',
      1: 'Normal (On-Grid)',
      2: 'Error',
      4: 'Check Mode',
    },
  })

  .methods({
    readWorkModeCode (register) {
      return this.readUInt16BE(register)
    },

    readWorkMode (register) {
      const value = this.readWorkModeCode(register)

      return this.getStampConfiguration().WORK_MODES[value] || 'unknown'
    },
  })
