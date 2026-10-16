// simulated GoodWe-inverter: answers modbus-rtu read (0x03) and write (0x06) requests via UDP on 127.0.0.1
import {CRC_16_ARRAY} from '../src/_bricks/reader/network/modbus.mjs'
import dgram from 'node:dgram'

function checksum (data) {
  let crc = 0xffff
  for (const byte of data) {
    crc = crc >> 8 ^ CRC_16_ARRAY[(crc ^ byte) & 0xff]
  }

  return crc
}


function withHeaderAndChecksum (body) {
  const crc = Buffer.alloc(2)
  crc.writeUInt16LE(checksum(body))

  return Buffer.concat([Buffer.from([0xaa, 0x55]), body, crc])
}


export function putString (registers, start, text, bytes) {
  const buffer = Buffer.alloc(bytes, ' ')
  buffer.write(text, 'ascii')
  for (let i = 0; i < bytes; i += 2) {
    registers.set(start + i / 2, buffer.readUInt16BE(i))
  }
}


export function putTimestamp (registers, start) {
  registers.set(start, 26 << 8 | 10) // 2026-10
  registers.set(start + 1, 16 << 8 | 12) // 16th, 12:00:00
  registers.set(start + 2, 0)
}


// online = false: no answers anymore (inverter switched off)
// delays[registerStart] = [ms, ms, ...]: delay of the next answers to this register
export async function startMock (registers, {delays = {}} = {}) {
  const socket = dgram.createSocket('udp4')
  const mock = {
    online  : true,
    requests: [],
    registers,
    close   : () => socket.close(),
  }

  socket.on('message', (message, rinfo) => {
    const address = message[0]
    const command = message[1]
    const start = message.readUInt16BE(2)
    const countOrValue = message.readUInt16BE(4)
    mock.requests.push({command, start, count: countOrValue, sourcePort: rinfo.port})
    if (!mock.online) {
      return
    }

    let answer
    if (command === 0x03) {
      const data = Buffer.alloc(countOrValue * 2)
      for (let i = 0; i < countOrValue; i++) {
        data.writeUInt16BE(registers.get(start + i) ?? 0, i * 2)
      }
      answer = withHeaderAndChecksum(Buffer.concat([Buffer.from([address, command, countOrValue * 2]), data]))
    } else if (command === 0x06) {
      registers.set(start, countOrValue)
      answer = withHeaderAndChecksum(Buffer.concat([Buffer.from([address, command]), message.subarray(2, 6)]))
    } else {
      return
    }

    setTimeout(() => socket.send(answer, rinfo.port, rinfo.address), delays[start]?.shift() ?? 0)
  })

  await new Promise(resolve => {
    socket.bind(0, '127.0.0.1', resolve)
  })
  mock.port = socket.address().port

  return mock
}


export function dtRegisters () {
  const registers = new Map()
  putString(registers, 30004, '5010KDTU000W0000', 16)
  putString(registers, 30012, 'GW10K-DT', 10)
  putTimestamp(registers, 30100)
  registers.set(30129, 1) // work mode: normal

  return registers
}


export function etRegisters () {
  const registers = new Map()
  putString(registers, 35003, '5010KETU000W0000', 16)
  putString(registers, 35011, 'GW10K-ET', 10)
  putTimestamp(registers, 35100)
  registers.set(35184, 3) // battery mode: charging => bms- and settings-data are read
  registers.set(35187, 1) // work mode: normal
  registers.set(45356, 10) // BattSOCUnderMin
  registers.set(47511, 1) // EMSPowerMode
  registers.set(47512, 10000) // EMSPowerSet

  return registers
}
