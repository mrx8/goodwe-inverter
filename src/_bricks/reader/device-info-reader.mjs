import Factory from 'stampit'
import Reader from './reader.mjs'


export default Factory
  .configuration({
    maxCalls: 1,
  })

  .compose(Reader)
