import {PLATFORM_745_HV_MODELS, PLATFORM_745_LV_MODELS} from '../_bricks/sensors/read-is-745platform.mjs'
import {createAa55Packet, validateAa55Packet} from '../_bricks/reader/network/modbus.mjs'
import Factory from 'stampit'
import GetStamp from '../shared/get-stamp.mjs'
import Log from '../shared/log.mjs'
import Network from '../_bricks/reader/network/network.mjs'
import {ProgrammerError} from '../shared/error.mjs'


const PLATFORM_205_MODELS = [
  'ETU', 'ETL', 'ETR', 'BHN', 'EHU', 'BHU', 'EHR', 'BTU',
]

const PLATFORM_753_MODELS = [
  'AES', 'HHI', 'ABP', 'EHB', 'HSB', 'HUA', 'CUA',
]

const ET_MODEL_TAGS = [
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


export default Factory
  .configuration({
    DT_MODEL_TAGS: [
      'DTU', 'DTS', 'MSU', 'MST', 'MSC', 'DSN', 'DTN', 'DST', 'NSU', 'SSN', 'SST', 'SSX', 'SSY', 'PSB', 'PSC',
    ],

    ET_MODEL_TAGS,
  })

  .compose(
    Log,
    GetStamp,
    Network,
  )

  .setLogId('detectInverter')

  .init(async (param, {
    instance: instancePromise,
  }) => {
    const instance = await instancePromise

    // Determine via serialNumber
    try {
      instance.log.debug('try to determine Inverter via AA55-protocol.')
      const {modelName, serialNumber} = await getDeviceIdViaAa55.call(instance)
      instance.log.debug('inverter responded via AA55-protocol.')
      instance.log.debug('now try to determine inverter from S/N: %s with param %o.', serialNumber, param)
      for (const model of instance.getStampConfiguration().ET_MODEL_TAGS) {
        if (serialNumber.includes(model)) {
          const {default: Inverter} = await import('./et/inverter.mjs')// eslint-disable-line no-await-in-loop
          const inverter = await Inverter.setLogId(param.ip).create(param) // eslint-disable-line no-await-in-loop
          instance.log.debug('SUCCESS! Detected ET/EH/BT/BH/GEH inverter %s, S/N: %s.', modelName, serialNumber)

          return inverter
        }
      }

      for (const model of instance.getStampConfiguration().DT_MODEL_TAGS) {
        if (serialNumber.includes(model)) {
          const {default: Inverter} = await import('./dt/inverter.mjs') // eslint-disable-line no-await-in-loop
          const inverter = await Inverter.setLogId(param.ip).create(param) // eslint-disable-line no-await-in-loop
          instance.log.debug('SUCCESS! Detected DT/MS/D-NS/XS/GEP inverter %s, S/N: %s.', modelName, serialNumber)

          return inverter
        }
      }
    } catch (e) {
      if (e.code !== 'REQUEST_TIMED_OUT') {
        throw e
      }
      instance.log.debug('inverter timed out via AA55-protocol.')
    }

    // else try Inverter one by one
    instance.log.debug('finally try to determine inverter directly with param %o.', param)
    for (const model of ['ET', 'DT']) {
      try {
        instance.log.debug('check for model %s.', model)
        const {default: Inverter} = await import(`./${model.toLowerCase()}/inverter.mjs`) // eslint-disable-line no-await-in-loop
        const inverter = await Inverter.setLogId(param.ip).create(param) // eslint-disable-line no-await-in-loop
        instance.log.debug('SUCCESS! Found model %s-type inverter, S/N: %s.', model, inverter.data.deviceInfo.serialNumber)

        return inverter
      } catch (e) {
        if (e.code === 'REQUEST_TIMED_OUT') {
          instance.log.debug('check for model %s timed out.', model)
          continue
        } else {
          throw e
        }
      }
    }

    instance.log.debug('FAILURE! I cannot determine your inverter...')
    throw new ProgrammerError('unknown inverter', 'ERROR_UNKNOWN_INVERTER')
  })
