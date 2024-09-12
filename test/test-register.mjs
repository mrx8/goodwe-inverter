import {describe, it} from 'mocha'
import {setTimeout as sleep} from 'node:timers/promises'
// const {expect} = require('../../../scripts/setup_tests')

describe('registers-test', function () {
  it('test getEntitlement', async function () {
    this.timeout(100000)
    const {default: createRegisters} = await import('../src/_bricks/registers.mjs')
    const registers = createRegisters()

    const id = setInterval(() => {
      registers.fetch()
    }, 500)

    await sleep(100)
    registers.add(35000).then(console.log)
    await sleep(100)
    registers.add(35020).then(console.log)
    await sleep(100)
    registers.add(35040).then(console.log)
    await sleep(100)
    registers.add(35032).then(console.log)
    await sleep(100)
    registers.add(35525).then(console.log)
    await sleep(100)
    registers.add(35570).then(console.log)
    await sleep(100)
    registers.add(35540).then(console.log)
    await sleep(100)
    registers.add(35225).then(console.log)
    await sleep(100)
    registers.add(35270).then(console.log)
    await sleep(100)
    registers.add(35240).then(console.log)

    await sleep(2000)
    clearInterval(id)
  })
})
