import Factory from 'stampit'
import ReadTemperature from '../running/read-temperature.mjs'


export default Factory
  .compose(ReadTemperature)
