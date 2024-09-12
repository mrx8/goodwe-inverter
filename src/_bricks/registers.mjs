import {EventEmitter, once} from 'node:events'
import Factory from 'stampit'
import {ProgrammerError} from '../shared/error.mjs'


const MaxRegisterDifference = 125 // GoodWe MODBUS-RTU obviously cannot transfer more than 125 registers


function _updateRegisters () {
  const sortedRegisters = [...this.registerSet]
    .map(register => Number(register))
    .toSorted()

  const registerLookup = new Map()
  let index = 0

  const registerIntervals = []
  let start = 0

  registerLookup.set(sortedRegisters[0], index)
  for (let end = 1; end < sortedRegisters.length; end++) {
    const currentRegister = sortedRegisters[end]

    if (currentRegister - sortedRegisters[start] > MaxRegisterDifference) {
      registerIntervals.push(sortedRegisters.slice(start, end))
      index++
      start = end
    }

    registerLookup.set(currentRegister, index)
  }

  registerIntervals.push(sortedRegisters.slice(start))

  this.registerIntervals = registerIntervals
  this.registerLookup = registerLookup
}


export default Factory
  .properties({
    eventEmitter     : new EventEmitter(),
    registerIntervals: [],
    registerSet      : new Set(),
    registerLookup   : new Map(),
    currentResults   : [],
    currentRound     : 0,
  })


  .methods({
    async add (register) {
      if (Number.isInteger(register) === false) {
        throw new ProgrammerError(`the param register ${register} is not an integer.`, 'PARAM_ERROR')
      }

      this.registerSet.add(register)
      _updateRegisters.call(this)
      console.log(`add ${register} for round ${this.currentRound}`)

      await once(this.eventEmitter, `new_data_arrived_${this.currentRound}`)

      return `${register} => ${this.currentResults[
        this.registerLookup.get(register)
      ]}`
    },


    fetch () {
      for (const [startRegister, endRegister] of this.registerIntervals) {
        console.log(`got message for ${startRegister}:${endRegister}`)
        this.currentResults.push(`received message from round ${this.currentRound} for ${startRegister}:${endRegister}`)
      }

      // fetch registers parallel or serial
      console.log(`emit => ${this.currentRound}`)
      this.eventEmitter.emit(`new_data_arrived_${this.currentRound}`)
      this.currentRound++
      // emit event
    },
  })
