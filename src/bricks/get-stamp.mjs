import Factory from 'stampit'
import {ProgrammerError} from '../error.mjs'

// generate a getStamp-method on every compose, which returns the stamp from which an instance was created
const RefStampSymbol = Symbol('RefStamp')

export default Factory
  .composers(({stamp}) => { // runs on every compose
    const compose = stamp.compose

    if (!compose.configuration) {
      compose.configuration = {}
    }

    if (!compose.methods) {
      compose.methods = {}
    }

    const oldGetStamp = compose.configuration[RefStampSymbol]
    if (oldGetStamp && compose.methods.getStamp && compose.methods.getStamp !== oldGetStamp) {
      throw new ProgrammerError(`mixin of "getStamp" is not allowed`, 'MIXIN_NOT_ALLOWED')
    }

    compose.methods.getStamp = compose.configuration[RefStampSymbol] = function () {
      return stamp
    }
  })

  .methods({
    getStampConfiguration () {
      return this.getStamp().compose.configuration
    },
  })
