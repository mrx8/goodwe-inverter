import {after, before, describe, it} from 'mocha'
import {dtRegisters, etRegisters, startMock} from './mock-inverter.mjs'
import DT from '../src/inverter/dt/inverter.mjs'
import ET from '../src/inverter/et/inverter.mjs'
import {expect} from 'chai'
import {setTimeout as sleep} from 'node:timers/promises'


describe('reading the inverter data', function () {
  const unhandledRejections = []
  const onUnhandledRejection = reason => unhandledRejections.push(reason)

  before(function () {
    process.on('unhandledRejection', onUnhandledRejection)
  })

  after(function () {
    process.off('unhandledRejection', onUnhandledRejection)
  })


  it('reads the device-info only once (maxCalls: 1)', async function () {
    const mock = await startMock(dtRegisters())
    let inverter
    try {
      inverter = await DT.setLogId('test-dt').create({ip: '127.0.0.1', port: mock.port, timeout: 200})
      inverter.updateInterval = 0
      for (let i = 0; i < 3; i++) {
        await inverter.updateChanges() // eslint-disable-line no-await-in-loop
      }
    } finally {
      mock.close()
    }

    expect(mock.requests.filter(request => request.start === 30001)).to.have.length(1)
    expect(mock.requests.filter(request => request.start === 30100)).to.have.length(4)
    expect(inverter.data.deviceInfo.serialNumber).to.equal('5010KDTU000W0000')
  })


  it('publishes changes of all settings, also when several readers fill settingsData', async function () {
    const mock = await startMock(etRegisters())
    let inverter
    let changes
    try {
      inverter = await ET.setLogId('test-et').create({ip: '127.0.0.1', port: mock.port, timeout: 200})
      inverter.updateInterval = 0
      expect(inverter.data.settingsData.batteryMinimumStateOfChargeOnGrid).to.equal(10)

      mock.registers.set(45356, 25)
      mock.registers.set(47512, 5000)
      changes = await inverter.updateChanges()
    } finally {
      mock.close()
    }

    expect(changes.settingsData).to.deep.equal({batteryMinimumStateOfChargeOnGrid: 25, EMSPowerSet: 5000})
    expect(inverter.data.settingsData.batteryMinimumStateOfChargeOnGrid).to.equal(25)
  })


  for (const [name, Inverter, registers] of [['DT', DT, dtRegisters], ['ET', ET, etRegisters]]) {
    it(`rejects without an unhandled rejection when the ${name}-inverter is switched off`, async function () {
      this.timeout(10000)
      const mock = await startMock(registers())
      let error
      let requestsWhileOff
      try {
        const inverter = await Inverter.setLogId(`test-${name}`).create({ip: '127.0.0.1', port: mock.port, timeout: 20})
        inverter.updateInterval = 0
        await inverter.updateChanges()

        mock.online = false
        const requestsBefore = mock.requests.length
        try {
          await inverter.updateChanges()
        } catch (e) {
          error = e
        }
        await sleep(100) // give pending rejections the chance to show up
        requestsWhileOff = mock.requests.length - requestsBefore
      } finally {
        mock.close()
      }

      expect(error?.code).to.equal('REQUEST_TIMED_OUT')
      expect(unhandledRejections).to.have.length(0)
      // only the first reader tries (10 x 2 requests), the following ones pass the error on without reading
      expect(requestsWhileOff).to.equal(20)
    })
  }
})
