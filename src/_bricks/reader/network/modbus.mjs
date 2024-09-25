import {from as ErrorFrom, OperationalError, ProgrammerError} from '../../../shared/error.mjs'

const AA55PACKET = {
  HEADER       : 0xaa55,
  ADDRESS      : 0x7f,
  ADDRESS_AP   : 0xc0,
  READ_COMMAND : 0x01,
  QUERY_ID_INFO: 0x02,
}

const CHECKSUM_LENGTH = 2
const MODBUS_HEADER = 0xaa55

export const MODBUS_READ_COMMAND = 0x03
export const MODBUS_READ_HEADER_LENGTH = 5

export const MODBUS_WRITE_COMMAND = 0x06
export const MODBUS_WRITE_HEADER_LENGTH = 4


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


export function createRtuRequestMessage (commandAddress, command, offset, value) {
  try {
    const message = Buffer.allocUnsafe(8)
    value = value >>> 0 // convert from possible signed to unsigned

    message[0] = commandAddress
    message[1] = command
    message.writeUInt16BE(offset, 2)
    message.writeUInt16BE(value, 4)

    const checksum = modbusChecksum(message.subarray(0, 6))
    message.writeUInt16LE(checksum, 6)

    return message
  } catch (e) {
    throw ErrorFrom(e)
  }
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

export function validateRtuResponseMessage (message, address, command, offset, value) {
  let expectedLength

  if (message.length <= 4) {
    throw new OperationalError('Response is too short.', 'PROTOCOL_ERROR')
  }

  if (message.readUInt16BE(0) !== MODBUS_HEADER) {
    throw new OperationalError(
      `Response has no valid header: ${message.subarray(0, 2).toString('hex')}, expected: ${MODBUS_HEADER.toString(16)}.`,
      'PROTOCOL_ERROR',
    )
  }

  if (message[2] !== address) {
    throw new OperationalError(`Response has no valid address-header: ${message[2]}, expected: ${address}.`, 'PROTOCOL_ERROR')
  }


  if (message[3] === MODBUS_READ_COMMAND) {
    if (message[4] !== value * 2) {
      throw new OperationalError(`Response has unexpected length: ${message[4].toString(16)}, expected: ${(value * 2).toString(16)}.`, 'PROTOCOL_ERROR')
    }

    expectedLength = message[4] + 7
    if (message.length < expectedLength) {
      throw new OperationalError(
        `partial message received. Length should be ${message.length.toString(16)} but was ${expectedLength.toString(16)}`,
        'PROTOCOL_ERROR',
      )
    }
  } else if (message[3] === MODBUS_WRITE_COMMAND) {
    expectedLength = 10
    if (message.length < expectedLength) {
      throw new OperationalError(`Response has unexpected length: ${message.length.toString(16)}, expected: ${expectedLength.toString(16)}.`, 'PROTOCOL_ERROR')
    }
    const responseOffset = message.readUInt16BE(4)
    if (responseOffset !== offset) {
      throw new OperationalError(`Response has wrong offset: ${responseOffset}, expected: ${offset}.`, 'PROTOCOL_ERROR')
    }

    const responseValue = message.readInt16BE(6)
    if (responseValue !== value) {
      throw new OperationalError(`Response has wrong value: ${responseValue}, expected: ${value}.`, 'PROTOCOL_ERROR')
    }
  } else {
    expectedLength = message.length
  }


  const checksumOffset = expectedLength - 2
  if (modbusChecksum(message.subarray(2, checksumOffset)) !== message.readUInt16LE(checksumOffset)) {
    throw new OperationalError('Response CRC-16 checksum does not match.', 'PROTOCOL_ERROR')
  }

  if (message[3] !== command) {
    const failureCode = FAILURE_CODES[message[4]] || 'UNKNOWN'
    throw new OperationalError(`Response command failure: ${failureCode}.`, 'PROTOCOL_ERROR')
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
  try {
    const headerLength = 6
    let crc = 0
    const message = Buffer.allocUnsafe(headerLength + data.length + CHECKSUM_LENGTH)

    message.writeUInt16BE(AA55PACKET.HEADER, 0)
    message[2] = AA55PACKET.ADDRESS_AP
    message[3] = AA55PACKET.ADDRESS
    message[4] = AA55PACKET.READ_COMMAND
    message[5] = AA55PACKET.QUERY_ID_INFO

    data.copy(message, 6)

    for (let i = 0, maxLen = message.length - CHECKSUM_LENGTH; i < maxLen; i++) {
      crc = crc + message[i]
    }

    message.writeUInt16BE(crc, message.length - 2)

    return message
  } catch (e) {
    throw ErrorFrom(e)
  }
}


export function validateAa55Packet (message) {
  let crc = 0
  for (let i = 0, maxLen = message.length - 2; i < maxLen; i++) {
    crc = crc + message[i]
  }

  if (message.readUInt16BE(message.length - 2) !== crc) {
    throw new ProgrammerError('crc is incorrect', 'PROTOCOL_ERROR')
  }

  if (message.readUInt16BE(0) !== AA55PACKET.HEADER) {
    throw new ProgrammerError('header is incorrect', 'PROTOCOL_ERROR')
  }

  if (message[2] !== AA55PACKET.ADDRESS) {
    throw new ProgrammerError('address is incorrect', 'PROTOCOL_ERROR')
  }

  if (message[3] !== AA55PACKET.ADDRESS_AP) {
    throw new ProgrammerError('address_ap is incorrect', 'PROTOCOL_ERROR')
  }

  if (message[4] !== AA55PACKET.READ_COMMAND) {
    throw new ProgrammerError('read_command is incorrect', 'PROTOCOL_ERROR')
  }

  if (message[5] !== (AA55PACKET.QUERY_ID_INFO | 0x80)) {
    throw new ProgrammerError('query_id_info is incorrect', 'PROTOCOL_ERROR')
  }

  return true
}
