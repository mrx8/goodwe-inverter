import Factory from 'stampit'
import MeterDataParserBasic from './meter-data-parser-basic.mjs'
import MeterDataParserExtended from './meter-data-parser-extended.mjs'

export default Factory
  .compose(
    MeterDataParserBasic,
    MeterDataParserExtended,
  )

  .init((param, {instance}) => {
    return instance
  })
