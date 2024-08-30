import Factory from 'stampit'
import ReadUInt16BE from './read-uint16be.mjs'
import {SAFETY_COUNTRIES} from '../constants.mjs'

export default Factory
  .compose(ReadUInt16BE)

  .methods({
    _readSafetyCountryCode (register) {
      return this._readUInt16BE(register)
    },

    _readSafetyCountry (register) {
      const value = this._readSafetyCountryCode(register)

      return SAFETY_COUNTRIES[value] || 'unknown'
    },
  })
