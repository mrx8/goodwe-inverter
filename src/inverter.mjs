import {MODBUS_ADDRESS, MODBUS_READ_CMD, createRtuRequestMessage, validatePacket} from './modbus.mjs'
import Factory from 'stampit'
import Protocol from './protocol.mjs'


const SINGLE_PHASE_MODELS = [
  'DSN', 'DST', 'NSU', 'SSN', 'SST', 'SSX', 'SSY', // DT
  'MSU', 'MST', 'PSB', 'PSC',
  'MSC', // Found on third gen MS
  'EHU', 'EHR', 'HSB', // ET
  'ESN', 'EMN', 'ERN', 'EBN', 'HLB', 'HMB', 'HBB', 'SPN',
]


function determinePhases (serialNumber) {
  for (const model of SINGLE_PHASE_MODELS) {
    if (serialNumber.includes(model)) {
      return 1
    }
  }

  return 3
}


const utf16beDecoder = new TextDecoder('utf-16be')


function decode (message) {
  let isBinary = false
  for (const byte of message) {
    if (byte < 32) {
      isBinary = true
    }
  }

  if (isBinary) {
    return utf16beDecoder.decode(message).replace('\x00', '').trimEnd()
  }

  return message.toString('ascii').trimEnd()
}


function readUInt16BE (message, offset) {
  let value = message.readUInt16BE(offset)
  if (value === 65535) {
    value = 0
  }

  return value
}


async function getDeviceInfo () {
  const offset = 0x7531
  const value = 0x28

  const message = createRtuRequestMessage({
    address: MODBUS_ADDRESS,
    command: MODBUS_READ_CMD,
    offset,
    value,
  })

  const responseMessage = await this.requestResponse(message)

  const isValid = validatePacket(responseMessage, MODBUS_READ_CMD, offset, value)
  if (isValid) {
    const serialNumber = decode(responseMessage.subarray(11, 31)) // 30004 - 30012
    const modelName = responseMessage.subarray(27, 37).toString('ascii').trimEnd()
    const dsp1Version = responseMessage.readUInt16BE(71) // 30034
    const dsp2Version = responseMessage.readUInt16BE(73) // 30035
    const armVersion = responseMessage.readUInt16BE(75) // 30036
    const dspSvnVersion = readUInt16BE(responseMessage, 77) // 35037
    const armSvnVersion = readUInt16BE(responseMessage, 79) // 35038
    const firmware = `${dsp1Version}.${dsp2Version}.${armVersion}`
    const numberOfPhases = determinePhases(serialNumber)

    return {
      valid: true,
      serialNumber,
      modelName,
      dsp1Version,
      dsp2Version,
      armVersion,
      dspSvnVersion,
      armSvnVersion,
      firmware,
      numberOfPhases,
    }
  }

  return {
    valid: false,
  }
}


const InverterInfo = Protocol
  .init(async (param, {
    instance: instancePromise,
  }) => {
    const instance = await instancePromise
    const deviceInfo = await getDeviceInfo.call(instance)

    return deviceInfo
  })


export default Factory
  .statics({
    async from (param) {
      const deviceInfo = await InverterInfo(param)

      // ToDo. determine which inverter to load
      if (deviceInfo.serialNumber) {
        const {default: Inverter} = await import('./inverter-dt.mjs')

        const inverter = await Inverter(param)
        inverter.deviceInfo = deviceInfo

        return inverter
      }

      throw new Error('Inverter not known!')
    },
  })
  //  return this.requestResponse(Buffer.from('7F03753100280409', 'hex'))


/* device info message parse ET
    this.#client.once("message", (rcvbuf) => {
      if (this.#CheckRecPacket(rcvbuf, sendbuf[4], sendbuf[5])) {
        this.#idInfo.FirmwareVersion = this.#GetStringFromByteArray(rcvbuf, 7, 5);
        this.#idInfo.ModelName = this.#GetStringFromByteArray(rcvbuf, 12, 10);
        this.#idInfo.Na = rcvbuf.slice(22, 37);
        this.#idInfo.SerialNumber = this.#GetStringFromByteArray(rcvbuf, 38, 16);
        this.#idInfo.NomVpv = this.#GetUintFromByteArray(rcvbuf, 54, 4) / 10;
        this.#idInfo.InternalVersion = this.#GetStringFromByteArray(rcvbuf, 58, 12);
        this.#idInfo.SafetyCountryCode = rcvbuf[70];

        this.#status = GoodWeUdp.ConStatus.Online;
      } else {
        this.#status = GoodWeUdp.ConStatus.Offline;
      }
    });


    #CheckRecPacket(Data, CtrCode, FctCode) {
  let packetFormat = new Uint8Array(GoodWePacket.Format.Packet);
  let packetCrc = new Uint8Array(GoodWePacket.Format.Checksum);
  let i;
  let crc = 0;
  let low, high;

  packetFormat = Data.slice(0, GoodWePacket.Format.Packet);
  packetCrc = Data.slice(Data.length - GoodWePacket.Format.Checksum, Data.length);

  for (i = 0; i < Data.length - GoodWePacket.Format.Checksum; i++) {
    crc = crc + Data[i];
  }

  high = crc >> 8;
  low = crc & 0x00ff;

  if (packetCrc[0] == high && packetCrc[1] == low) {
    if (packetFormat[0] == GoodWePacket.Header.High && packetFormat[1] == GoodWePacket.Header.Low) {
      if (packetFormat[2] == GoodWePacket.Addr.Inverter && packetFormat[3] == GoodWePacket.Addr.AP) {
        if (packetFormat[4] == CtrCode) {
          if (packetFormat[5] == (FctCode | 0x80)) {
            return true;
          }
        }
      }
    }
  }
  return false;
      */
