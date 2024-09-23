import Factory from 'stampit'
import Reader from './reader.mjs'


export default Factory
  .compose(Reader)

  .configuration({
    maxCalls: 1,
  })
