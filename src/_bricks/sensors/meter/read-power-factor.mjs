import Factory from 'stampit'
import ReadPowerFactor from '../running/read-power-factor.mjs'

export default Factory
  .compose(
    ReadPowerFactor,
  )
