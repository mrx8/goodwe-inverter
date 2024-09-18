import Factory from 'stampit'
import GetStamp from '../../../shared/get-stamp.mjs'
import ReadUInt16BE from '../read-uint16be.mjs'


export default Factory
  .compose(
    GetStamp,
    ReadUInt16BE,
  )

  .configuration({
    GRID_IN_OUT_MODES: {
      0: 'Idle',
      1: 'Exporting',
      2: 'Importing',
    },
  })

  .methods({
    readGridModeCode (register) {
      const value = this.readUInt16BE(register)

      if (value < -90) {
        return 2
      }

      if (value >= 90) {
        return 1
      }

      return 0
    },

    readGridMode (register) {
      const value = this.readGridModeCode(register)

      return this.getStampConfiguration().GRID_IN_OUT_MODES[value]
    },

  })
