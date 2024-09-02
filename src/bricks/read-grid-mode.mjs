import Factory from 'stampit'
import GetStamp from './get-stamp.mjs'
import ReadInt16BE from './read-int16be.mjs'


export default Factory
  .compose(
    GetStamp,
    ReadInt16BE,
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
      const value = this.readInt16BE(register)
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
