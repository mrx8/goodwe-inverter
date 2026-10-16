import {after, before, describe, it} from 'mocha'
import DiscoverInverters from '../src/inverter/discover.mjs'
import dgram from 'node:dgram'
import {expect} from 'chai'
import {readdirSync} from 'node:fs'
import {setTimeout as sleep} from 'node:timers/promises'


describe('discovery of inverters', function () {
  const originalSend = dgram.Socket.prototype.send

  before(function () { // don't send broadcasts into the LAN
    dgram.Socket.prototype.send = function (...args) {
      const callback = args.at(-1)
      if (typeof callback === 'function') {
        setImmediate(callback)
      }
    }
  })

  after(function () {
    dgram.Socket.prototype.send = originalSend
  })


  it('closes its socket after every discovery', async function () {
    const openFiles = () => readdirSync('/proc/self/fd').length
    const openFilesBefore = openFiles()
    for (let i = 0; i < 50; i++) {
      await DiscoverInverters({timeout: 5}) // eslint-disable-line no-await-in-loop
    }
    await sleep(50)

    expect(openFiles() - openFilesBefore).to.be.at.most(2)
  })
})
