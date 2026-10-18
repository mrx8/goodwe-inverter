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


  describe('with answering inverters', function () {
    const answers = [
      '192.168.30.10,289C6E0A1B2C,Solar-WiFi1',
      '192.168.30.11,289C6E0A1B2D,Solar-WiFi2',
      '192.168.30.12,289C6E0A1B2E,Solar-WiFi3',
    ]
    let inverterSocket

    before(async function () { // the inverters answer from the broadcast-port on localhost
      inverterSocket = dgram.createSocket('udp4')
      await new Promise(resolve => {
        inverterSocket.bind(48899, '127.0.0.1', resolve)
      })
      dgram.Socket.prototype.send = function (...args) {
        if (this === inverterSocket) {
          return originalSend.apply(this, args)
        }
        const {port} = this.address()
        for (const answer of answers) {
          originalSend.call(inverterSocket, Buffer.from(answer), port, '127.0.0.1')
        }
        const callback = args.at(-1)
        if (typeof callback === 'function') {
          setImmediate(callback)
        }
      }
    })

    after(function () {
      inverterSocket.close()
    })


    it('finds all inverters without an ignore-list', async function () {
      const found = await DiscoverInverters({timeout: 100})

      expect(found.map(({ip}) => ip)).to.have.members(['192.168.30.10', '192.168.30.11', '192.168.30.12'])
      expect(found.find(({ip}) => ip === '192.168.30.10').macAdress).to.equal('28:9C:6E:0A:1B:2C')
    })


    it('skips inverters by mac-address in any notation and by ip', async function () {
      const found = await DiscoverInverters({
        timeout: 100,
        ignore : ['28:9c:6e:0a:1b:2c', '192.168.30.12'],
      })

      expect(found.map(({ip}) => ip)).to.deep.equal(['192.168.30.11'])

      const foundAgain = await DiscoverInverters({
        timeout: 100,
        ignore : [' 289C6E0A1B2D ', '28-9C-6E-0A-1B-2E'],
      })

      expect(foundAgain.map(({ip}) => ip)).to.deep.equal(['192.168.30.10'])
    })
  })
})
