import {SINGLE_PHASE_MODELS} from './constants.mjs'


export function determinePhases (serialNumber) {
  for (const model of SINGLE_PHASE_MODELS) {
    if (serialNumber.includes(model)) {
      return 1
    }
  }

  return 3
}


const utf16beDecoder = new TextDecoder('utf-16be')


export function decode (message) {
  let isBinary = false
  for (const byte of message) {
    if (byte < 32) {
      isBinary = true
    }
  }
  // console.log('isBinary', isBinary, message)
  if (isBinary) {
    return utf16beDecoder.decode(message).replace('\x00', '').trimEnd()
  }

  return message.toString('ascii').trimEnd()
}


export function readUInt16BE (message, offset) {
  let value = message.readUInt16BE(offset)
  if (value === 65535) {
    value = 0
  }

  return value
}
