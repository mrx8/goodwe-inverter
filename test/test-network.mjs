import {describe, it} from 'mocha'
import {dtRegisters, startMock} from './mock-inverter.mjs'
import ReadMessage from '../src/_bricks/reader/network/read-message.mjs'
import {expect} from 'chai'
import {setTimeout as sleep} from 'node:timers/promises'


describe('request/response via UDP', function () {
  it('ignores a late answer to an earlier request', async function () {
    // like seen on the XS-inverters: the answer to 30001 comes after the timeout, while the request for 30100 is running
    const mock = await startMock(dtRegisters(), {delays: {30001: [160], 30100: [90]}})
    let deviceInfo
    let runningData
    try {
      const reader = ReadMessage.setLogId('test-network').create({ip: '127.0.0.1', port: mock.port, timeout: 100, address: 0x7f})
      deviceInfo = await reader.readMessage({registerStart: 30001, registerCount: 40}) // 1st try times out, 2nd try ok
      runningData = await reader.readMessage({registerStart: 30100, registerCount: 73}) // late answer of 30001 arrives meanwhile
      await sleep(100)
    } finally {
      mock.close()
    }

    expect(deviceInfo).to.have.length(40 * 2 + 2) // data + checksum
    expect(runningData).to.have.length(73 * 2 + 2)
    expect(mock.requests.map(request => request.start)).to.deep.equal([30001, 30001, 30100])
  })
})
