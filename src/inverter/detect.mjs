// import {MODBUS_ADDRESS, MODBUS_READ_CMD, createRtuRequestMessage, validatePacket} from './modbus.mjs'
import {DT_MODEL_TAGS, ET_MODEL_TAGS} from '../constants.mjs'
import {createAa55Packet, validateAa55Packet} from '../modbus.mjs'
import Factory from 'stampit'
import Log from '../log.mjs'
import Protocol from '../protocol.mjs'
// import {decode} from './shared.mjs'

async function getDeviceIdViaAa55 () {
  const requestMessage = createAa55Packet(Buffer.from('00', 'hex'))
  const responseMessage = await this.requestResponse(requestMessage)
  const isValid = validateAa55Packet(responseMessage)
  if (isValid) {
    return {
      isValid,
      modelName   : responseMessage.subarray(12, 22).toString().trimEnd(),
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

    // Determine via serialNumber
    try {
      Log.debug('try to determine Inverter via AA55-protocol.')
      const {isValid, modelName, serialNumber} = await getDeviceIdViaAa55.call(instance)
      Log.debug('inverter responded via AA55-protocol.')
      if (isValid) {
        Log.debug('now try to determine inverter from S/N: %s.', serialNumber)
        for (const model of ET_MODEL_TAGS) {
          if (serialNumber.includes(model)) {
            Log.debug('SUCCESS! Detected ET/EH/BT/BH/GEH inverter %s, S/N: %s.', modelName, serialNumber)
            const {default: Inverter} = await import('./et/inverter.mjs')// eslint-disable-line no-await-in-loop
            const inverter = await Inverter(param) // eslint-disable-line no-await-in-loop

            return inverter
          }
        }

        // for (const model of ES_MODEL_TAGS) {
        //   if (serialNumber.includes(model)) {
        //     console.debug(`SUCCESS! Detected ES/EM/BP inverter ${modelName}, S/N: ${serialNumber}.`)
        //     const {default: Inverter} = await import('./inverter-es.mjs') // eslint-disable-line no-await-in-loop

        //     return Inverter
        //   }
        // }

        for (const model of DT_MODEL_TAGS) {
          if (serialNumber.includes(model)) {
            Log.debug('SUCCESS! Detected DT/MS/D-NS/XS/GEP inverter %s, S/N: %s.', modelName, serialNumber)
            const {default: Inverter} = await import('./dt/inverter.mjs') // eslint-disable-line no-await-in-loop
            const inverter = await Inverter(param) // eslint-disable-line no-await-in-loop

            return inverter
          }
        }
      } else {
        Log.debug('response is invalid.')
      }
    } catch (e) {
      if (e.code !== 'REQUEST_TIMED_OUT') {
        throw e
      }
      Log.debug('inverter timed out via AA55-protocol.')
    }

    // else try Inverter one by one
    Log.debug('finally try to determine inverter directly')
    // for (const model of ['ET', 'DT', "ES"]) {
    for (const model of ['ET', 'DT']) {
      try {
        Log.debug('check for model %s.', model)
        const {default: Inverter} = await import(`./${model.toLowerCase()}/inverter.mjs`) // eslint-disable-line no-await-in-loop
        const inverter = await Inverter(param) // eslint-disable-line no-await-in-loop
        Log.debug('SUCCESS! Found model %s-type inverter', model)

        return inverter
      } catch (e) {
        if (e.code === 'REQUEST_TIMED_OUT') {
          Log.debug('check for model %s timed out.', model)
          continue
        } else {
          throw e
        }
      }
    }

    Log.debug('FAILURE! I cannot determine your inverter.')
    const error = new Error('unknown inverter')
    error.code = 'UNKNOWN_INVERTER'
    throw error
  })


export default Factory
  .statics({
    async from (param) {
      const inverter = await InverterInfo(param)

      return inverter
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
