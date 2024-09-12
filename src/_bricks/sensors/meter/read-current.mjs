import Factory from 'stampit'
import ReadCurrent from '../running/read-current.mjs'

export default Factory
  .compose(
    ReadCurrent,
  )
