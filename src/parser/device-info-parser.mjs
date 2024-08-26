import Factory from 'stampit'
import parser from './parser.mjs'
import read from './read.mjs'


export default Factory
  .compose(read, parser)

  .methods({
    readVoltage (register) {
      const index = this.getIndexFromRegister(register)
      const value = this.readUInt16BE(this.message, index)

      return value / 10
    },
  })

/*
  serialNumber : decode(responseMessage.subarray(11, 27)), // 30004 - 30012
      modelName    : responseMessage.subarray(27, 37).toString('ascii').trimEnd(),
      dsp1Version  : responseMessage.readUInt16BE(71), // 30034
      dsp2Version  : responseMessage.readUInt16BE(73), // 30035
      armVersion   : responseMessage.readUInt16BE(75), // 30036
      dspSvnVersion: readUInt16BE(responseMessage, 77), // 35037
      armSvnVersion: readUInt16BE(responseMessage, 79), // 35038
*/
hier voltage, current, etc. auslagern in extra Factory
