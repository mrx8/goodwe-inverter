// import {PartialResponseException, RequestRejectedException} from './exceptions.mjs'

const AA55PACKET = {
  HEADER_HIGH  : 0xaa,
  HEADER_LOW   : 0x55,
  ADDRESS      : 0x7f,
  ADDRESS_AP   : 0xc0,
  READ_COMMAND : 0x01,
  QUERY_ID_INFO: 0x02,
}

const PACKET = {
  ADDRESS     : 0x7f,
  READ_COMMAND: 0x03,
}

// const REGISTER = {
//   ADDRESS     : 0xf7,
//   READ_COMMAND: 0x03,
// }

const CHECKSUM_LENGTH = 2
const MODBUS_HEADER_HIGH = 0xaa
const MODBUS_HEADER_LOW = 0x55
const MODBUS_WRITE_CMD = 0x06
const MODBUS_WRITE_MULTI_CMD = 0x10

const FAILURE_CODES = {
  1 : 'ILLEGAL_FUNCTION',
  2 : 'ILLEGAL_DATA_ADDRESS',
  3 : 'ILLEGAL_DATA_VALUE',
  4 : 'SLAVE_DEVICE_FAILURE',
  5 : 'ACKNOWLEDGE',
  6 : 'SLAVE_DEVICE_BUSY',
  7 : 'NEGATIVE_ACKNOWLEDGEMENT',
  8 : 'MEMORY_PARITY_ERROR',
  10: 'GATEWAY_PATH_UNAVAILABLE',
  11: 'GATEWAY_TARGET_DEVICE_FAILED_TO_RESPOND',
}


function create_crc16_array () {
  const array = []
  for (let i = 0; i < 256; i++) {
    let buffer = i << 1
    let crc = 0
    for (let j = 0; j < 8; j++) {
      buffer >>= 1
      if ((buffer ^ crc) & 0x0001) {
        crc = crc >> 1 ^ 0xa001
      } else {
        crc >>= 1
      }
    }
    array.push(crc)
  }

  return array
}

export const CRC_16_ARRAY = create_crc16_array()
// console.log(require('node:util').inspect(CRC_16_ARRAY, {maxArrayLength: Infinity}))


function modbusChecksum (data) {
  let crc = 0xffff

  for (const byte of data) {
    crc = crc >> 8 ^ CRC_16_ARRAY[(crc ^ byte) & 0xff]
  }

  return crc
}


export function createRtuRequestMessage (offset, value) {
  const message = Buffer.allocUnsafe(8)

  message[0] = PACKET.ADDRESS
  message[1] = PACKET.READ_COMMAND
  message[2] = offset >> 8 & 0xff
  message[3] = offset & 0xff
  message[4] = value >> 8 & 0xff
  message[5] = value & 0xff

  const checksum = modbusChecksum(message.subarray(0, 6))

  message[6] = checksum & 0xff
  message[7] = checksum >> 8 & 0xff

  // console.log('construct message', message.toString('hex'))

  return message
}


// export function validatePacket (message, CtrCode, FctCode) {
// export function validatePacket (message) {
//   console.log('validate message', message.toString('hex'))
//   const packetFormat = message.slice(0, 7)
//   const packetCrc = message.slice(message.length - 2, message.length)

//   let crc = 0
//   for (let i = 0, max = message.length - 2; i < max; i++) {
//     crc = crc + message[i]
//   }

//   const high = crc >> 8
//   const low = crc & 0x00ff

//   if (packetCrc[0] === high && packetCrc[1] === low) {
//     console.log('crc correct')
//     if (packetFormat[0] === 0xaa && packetFormat[1] === 0x55) {
//       console.log('header correct')
//       if (packetFormat[2] === 0x7f && packetFormat[3] === 0xc0) {
//         console.log('valid')

//         return true
//         // if (packetFormat[4] === CtrCode) {
//         //   if (packetFormat[5] === (FctCode | 0x80)) {
//         //     return true
//         //   }
//         // }
//       }
//     }
//   }

//   console.log('not valid')

//   return false
// }

export function validateRtuRequestMessage (message, offset, value) {
  let expectedLength

  if (message.length <= 4) {
    console.debug('Response is too short.')

    return false
  }

  if (message[0] !== MODBUS_HEADER_HIGH || message[1] !== MODBUS_HEADER_LOW) {
    console.debug(`Response has no valid header: ${message[0]}:${message[1]}, expected: ${MODBUS_HEADER_HIGH}:${MODBUS_HEADER_LOW}.`)

    return false
  }

  if (message[2] !== PACKET.ADDRESS) {
    console.debug(`Response has no valid address-header: ${message[2]}, expected: ${PACKET.ADDRESS}.`)

    return false
  }

  if (message[3] === PACKET.READ_COMMAND) {
    if (message[4] !== value * 2) {
      console.debug(`Response has unexpected length: ${message[4]}, expected: ${value * 2}.`)

      return false
    }

    expectedLength = message[4] + 7
    if (message.length < expectedLength) {
      console.debug(`partial message received. Length should be ${message.length} but was ${expectedLength}`)

      return false
    }
  } else if ([MODBUS_WRITE_CMD, MODBUS_WRITE_MULTI_CMD].includes(message[3])) {
    expectedLength = 10
    if (message.length < expectedLength) {
      console.debug(`Response has unexpected length: ${message.length}, expected: ${expectedLength}.`)

      return false
    }
    const responseOffset = message.readUInt16BE(4)
    if (responseOffset !== offset) {
      console.debug(`Response has wrong offset: ${responseOffset}, expected: ${offset}.`)

      return false
    }

    const responseValue = message.readInt16BE(6)
    if (responseValue !== value) {
      console.debug(`Response has wrong value: ${responseValue}, expected: ${value}.`)

      return false
    }
  } else {
    expectedLength = message.length
  }


  const checksumOffset = expectedLength - 2
  if (modbusChecksum(message.subarray(2, checksumOffset)) !== (message[checksumOffset + 1] << 8) + message[checksumOffset]) {
    console.debug('Response CRC-16 checksum does not match.')

    return false
  }

  if (message[3] !== PACKET.READ_COMMAND) {
    const failureCode = FAILURE_CODES[message[4]] || 'UNKNOWN'
    console.debug(`Response command failure: ${failureCode}.`)

    return false
  }

  return true
}


// export function createModbusRtuMultiRequest (commAddr, cmd, offset, values) {
//   const size = values.length
//   const totalMessageSize = 9 + size
//   const message = Buffer.allocUnsafe(totalMessageSize)
//   const checksumIndex = totalMessageSize - 2

//   message[0] = commAddr
//   message[1] = cmd
//   message[2] = offset >> 8 & 0xFF
//   message[3] = offset & 0xFF
//   message[4] = 0x00
//   message[5] = Math.floor(size / 2)
//   message[6] = size

//   values.copy(message, 7)

//   const checksum = modbusChecksum(message.subarray(0, 7 + size))
//   message[checksumIndex] = checksum
//   message[checksumIndex + 1] = checksum >> 8 & 0xFF

//   return message
// }


/*

import logging
from typing import Union

from .exceptions import PartialResponseException, RequestRejectedException

logger = logging.getLogger(__name__)

==> Hier!

def validate_modbus_rtu_response(data: bytes, cmd: int, offset: int, value: int) -> bool:
    if len(data) <= 4:
        logger.debug("Response is too short.")
        return False
    if data[3] == MODBUS_READ_CMD:
        if data[4] != value * 2:
            logger.debug("Response has unexpected length: %d, expected %d.", data[4], value * 2)
            return False
        expected_length = data[4] + 7
        if len(data) < expected_length:
            raise PartialResponseException(len(data), expected_length)
    elif data[3] in (MODBUS_WRITE_CMD, MODBUS_WRITE_MULTI_CMD):
        if len(data) < 10:
            logger.debug("Response has unexpected length: %d, expected %d.", len(data), 10)
            return False
        expected_length = 10
        response_offset = int.from_bytes(data[4:6], byteorder='big', signed=False)
        if response_offset != offset:
            logger.debug("Response has wrong offset: %X, expected %X.", response_offset, offset)
            return False
        response_value = int.from_bytes(data[6:8], byteorder='big', signed=True)
        if response_value != value:
            logger.debug("Response has wrong value: %X, expected %X.", response_value, value)
            return False
    else:
        expected_length = len(data)


    checksum_offset = expected_length - 2
    if _modbus_checksum(data[2:checksum_offset]) != ((data[checksum_offset + 1] << 8) + data[checksum_offset]):
        logger.debug("Response CRC-16 checksum does not match.")
        return False

    if data[3] != cmd:
        failure_code = FAILURE_CODES.get(data[4], "UNKNOWN")
        logger.debug("Response is command failure: %s.", FAILURE_CODES.get(data[4], "UNKNOWN"))
        raise RequestRejectedException(failure_code)

    return True
*/

// Buffer.from('AA55C07F0102000241', 'hex')
export function createAa55Packet (data) {
  const headerLength = 6
  let crc = 0
  const message = Buffer.allocUnsafe(headerLength + data.length + CHECKSUM_LENGTH)

  message[0] = AA55PACKET.HEADER_HIGH
  message[1] = AA55PACKET.HEADER_LOW
  message[2] = AA55PACKET.ADDRESS_AP
  message[3] = AA55PACKET.ADDRESS
  message[4] = AA55PACKET.READ_COMMAND
  message[5] = AA55PACKET.QUERY_ID_INFO

  data.copy(message, 6)

  for (let i = 0, maxLen = message.length - CHECKSUM_LENGTH; i < maxLen; i++) {
    crc = crc + message[i]
  }

  message[message.length - 2] = crc & 0xff
  message[message.length - 1] = crc >> 8 & 0xff

  // console.log('createAa55Packet', message, message.toString('hex'))

  return message
}


export function validateAa55Packet (message) {
  const packetHeader = message.slice(0, 7)
  const packetCrc = message.slice(message.length - 2, message.length)

  let crc = 0
  for (let i = 0, maxLen = message.length - 2; i < maxLen; i++) {
    crc = crc + message[i]
  }

  const high = crc >> 8
  const low = crc & 0xff

  if (packetCrc[0] === high && packetCrc[1] === low) {
    if (packetHeader[0] === AA55PACKET.HEADER_HIGH && packetHeader[1] === AA55PACKET.HEADER_LOW) {
      if (packetHeader[2] === AA55PACKET.ADDRESS && packetHeader[3] === AA55PACKET.ADDRESS_AP) {
        if (packetHeader[4] === AA55PACKET.READ_COMMAND) {
          if (packetHeader[5] === (AA55PACKET.QUERY_ID_INFO | 0x80)) {
            return true
          }
        }
      }
    }
  }

  return false
}
