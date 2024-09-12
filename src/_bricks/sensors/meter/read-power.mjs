import Factory from 'stampit'
import ReadPower from '../running/read-power.mjs'

export default Factory
  .compose(
    ReadPower,
  )
