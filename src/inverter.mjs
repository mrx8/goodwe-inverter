// import {MODBUS_ADDRESS, MODBUS_READ_CMD, createRtuRequestMessage, validatePacket} from './modbus.mjs'
import Factory from 'stampit'
import Protocol from './protocol.mjs'
import {decode} from './shared.mjs'
import {ET_MODEL_TAGS} from './constants.mjs'


function validateAa55Packet (message) {
  const CtrCode = 0x01
  const FctCode = 0x02

  const packetFormat = message.slice(0, 7)
  const packetCrc = message.slice(message.length - 2, message.length)

  let crc = 0
  for (let i = 0, maxLen = message.length - 2; i < maxLen; i++) {
    crc = crc + message[i]
  }

  const high = crc >> 8
  const low = crc & 0x00ff

  if (packetCrc[0] === high && packetCrc[1] === low) {
    if (packetFormat[0] === 0xaa && packetFormat[1] === 0x55) {
      if (packetFormat[2] === 0x7f && packetFormat[3] === 0xc0) {
        if (packetFormat[4] === CtrCode) {
          if (packetFormat[5] === (FctCode | 0x80)) {
            return true
          }
        }
      }
    }
  }

  return false
}


async function determineInverter (model, serialNumber) {
  for (const model of ET_MODEL_TAGS) {
    if (serialNumber.includes(model)) {
      console.debug(`Detected ET/EH/BT/BH/GEH inverter ${model}, S/N: ${serialNumber}.`)
      // import specific inverter and return instance
    }
  }
}
// i: Inverter | None = None
// for model_tag in ET_MODEL_TAGS:
//     if model_tag in serial_number:
//         logger.debug("Detected ET/EH/BT/BH/GEH inverter %s, S/N:%s.", model_name, serial_number)
//         i = ET(host, port, 0, timeout, retries)
//         break
// if not i:
//     for model_tag in ES_MODEL_TAGS:
//         if model_tag in serial_number:
//             logger.debug("Detected ES/EM/BP inverter %s, S/N:%s.", model_name, serial_number)
//             i = ES(host, port, 0, timeout, retries)
//             break
// if not i:
//     for model_tag in DT_MODEL_TAGS:
//         if model_tag in serial_number:
//             logger.debug("Detected DT/MS/D-NS/XS/GEP inverter %s, S/N:%s.", model_name, serial_number)
//             i = DT(host, port, 0, timeout, retries)
//             break
// if i:
//     await i.read_device_info()
//     logger.debug("Connected to inverter %s, S/N:%s.", i.model_name, i.serial_number)
//     return i


async function getDeviceIdViaAa55 () {
  const responseMessage = await this.requestResponse(Buffer.from('AA55C07F0102000241', 'hex'))
  const isValid = validateAa55Packet(responseMessage)
  if (isValid) {
    return {
      isValid,
      model       : responseMessage.subarray(12, 22).toString().trimEnd(),
      serialNumber: responseMessage.subarray(38, 54).toString(),
    }
  }

  return {
    isValid,
  }
}


const InverterInfo = Protocol
  .init(async (param, {
    instance: instancePromise,
  }) => {
    const instance = await instancePromise

    const {isValid, model, serialNumber} = await getDeviceIdViaAa55.call(instance)
    if (isValid) {
      const inverter = await determineInverter(model, serialNumber)

      return inverter
    }

    // try Inverter one by one

    return instance
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
