import Factory from 'stampit'
import ReadUInt16BE from './read-uint16be.mjs'
import {SAFETY_COUNTRIES} from '../constants.mjs'

export default Factory
  .compose(ReadUInt16BE)

  .methods({
    readSafetyCountryCode (register) {
      return this.readUInt16BE(register)
    },

    readSafetyCountry (register) {
      const value = this.readSafetyCountryCode(register)

      return SAFETY_COUNTRIES[value] || 'unknown'
    },
  })
