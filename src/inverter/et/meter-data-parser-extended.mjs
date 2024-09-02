import Factory from 'stampit'
import MeterDataParserBasic from './meter-data-parser-basic.mjs'


export default Factory
  .compose(
    MeterDataParserBasic,
  )

  .init((param, {instance}) => {
    return instance
  })
