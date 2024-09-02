import {PLATFORM_745_HV_MODELS, PLATFORM_745_LV_MODELS} from '../bricks/read-is-745platform.mjs'
import {createAa55Packet, validateAa55Packet} from '../modbus.mjs'
import Factory from 'stampit'
import GetStamp from '../bricks/get-stamp.mjs'
import Log from '../log.mjs'
import {ProgrammerError} from '../error.mjs'
import Protocol from '../network.mjs'
// import {decode} from './shared.mjs'

const PLATFORM_205_MODELS = [
  'ETU', 'ETL', 'ETR', 'BHN', 'EHU', 'BHU', 'EHR', 'BTU',
]


const PLATFORM_753_MODELS = [
  'AES', 'HHI', 'ABP', 'EHB', 'HSB', 'HUA', 'CUA',
]

export const ET_MODEL_TAGS = [
  ...PLATFORM_205_MODELS,
  ...PLATFORM_745_LV_MODELS,
  ...PLATFORM_745_HV_MODELS,
  ...PLATFORM_753_MODELS,
  'ETC', 'BTC', 'BTN',
]


async function getDeviceIdViaAa55 () {
  const requestMessage = createAa55Packet(Buffer.from('00', 'hex'))
  const responseMessage = await this.requestResponse(requestMessage)
  validateAa55Packet(responseMessage)

  return {
    modelName   : responseMessage.subarray(12, 22).toString().trimEnd(),
    serialNumber: responseMessage.subarray(38, 54).toString(),
  }
}


const InverterInfo = Factory
  .configuration({
    DT_MODEL_TAGS: [
      'DTU', 'DTS', 'MSU', 'MST', 'MSC', 'DSN', 'DTN', 'DST', 'NSU', 'SSN', 'SST', 'SSX', 'SSY', 'PSB', 'PSC',
    ],

    ET_MODEL_TAGS,
  })

  .compose(
    GetStamp,
    Protocol,
  )

  .init(async (param, {
    instance: instancePromise,
  }) => {
    const instance = await instancePromise

    // Determine via serialNumber
    try {
      Log.debug('try to determine Inverter via AA55-protocol.')
      const {modelName, serialNumber} = await getDeviceIdViaAa55.call(instance)
      Log.debug('inverter responded via AA55-protocol.')
      Log.debug('now try to determine inverter from S/N: %s.', serialNumber)
      for (const model of instance.getStampConfiguration().ET_MODEL_TAGS) {
        if (serialNumber.includes(model)) {
          Log.debug('SUCCESS! Detected ET/EH/BT/BH/GEH inverter %s, S/N: %s.', modelName, serialNumber)
          const {default: Inverter} = await import('./et/inverter.mjs')// eslint-disable-line no-await-in-loop
          const inverter = await Inverter(param) // eslint-disable-line no-await-in-loop

          return inverter
        }
      }

      for (const model of instance.getStampConfiguration().DT_MODEL_TAGS) {
        if (serialNumber.includes(model)) {
          Log.debug('SUCCESS! Detected DT/MS/D-NS/XS/GEP inverter %s, S/N: %s.', modelName, serialNumber)
          const {default: Inverter} = await import('./dt/inverter.mjs') // eslint-disable-line no-await-in-loop
          const inverter = await Inverter(param) // eslint-disable-line no-await-in-loop

          return inverter
        }
      }
    } catch (e) {
      if (e.code !== 'REQUEST_TIMED_OUT') {
        throw e
      }
      Log.debug('inverter timed out via AA55-protocol.')
    }

    // else try Inverter one by one
    Log.debug('finally try to determine inverter directly.')
    for (const model of ['ET', 'DT']) {
      try {
        Log.debug('check for model %s.', model)
        const {default: Inverter} = await import(`./${model.toLowerCase()}/inverter.mjs`) // eslint-disable-line no-await-in-loop
        const inverter = await Inverter(param) // eslint-disable-line no-await-in-loop
        Log.debug('SUCCESS! Found model %s-type inverter.', model)

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

    Log.debug('FAILURE! I cannot determine your inverter...')
    throw new ProgrammerError('unknown inverter', 'ERROR_UNKNOWN_INVERTER')
  })


export default Factory
  .statics({
    async from (param) {
      const inverter = await InverterInfo(param)

      return inverter
    },
  })
