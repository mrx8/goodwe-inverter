#!/usr/bin/env node
import DetectInverter from '../src/inverter/detect.mjs'
import DiscoverInverters from '../src/inverter/discover.mjs'
import Factory from 'stampit'
import Log from '../src/shared/log.mjs'
import Mqtt from 'mqtt'
import {program as Program} from 'commander'
import {createRequire} from 'module'
import {required} from '../src/shared/required.mjs'
import {setTimeout as sleep} from 'node:timers/promises'

const require = createRequire(import.meta.url)
const packageJson = require('../package.json')

let client
const MQTT_URI = process.env.MQTT_URI || null
if (MQTT_URI === null) {
  client = {
    publishAsync (path, value) {
      console.log(`${path} => ${value}`)
    },
  }
} else {
  client = await Mqtt.connectAsync(process.env.MQTT_URI)
}


function* recursiveIterate (path, iterator) {
  for (let [name, value] of Object.entries(iterator)) {
    if (value === undefined) {
      continue
    }

    const newPath = `${path}.${name}`
    if (Array.isArray(value)) {
      value = JSON.stringify(value)
    }
    if (typeof value === 'string' || typeof value === 'number' || value === null) {
      yield [newPath, value.toString()]
    } else {
      yield* recursiveIterate(newPath, value)
    }
  }
}


function createPublisher (inverter) {
  const serialNumber = inverter.data.deviceInfo.serialNumber

  return async data => {
    const promises = []
    const mqttPath = `goodwe.inverters.${serialNumber}`
    this.log.trace('publish sensors with path %s to mqtt', mqttPath)
    for (const [path, value] of recursiveIterate(mqttPath, data)) {
      promises.push(
        client.publishAsync(path, value, {
          properties: {
            messageExpiryInterval: 5,
          },
        }),
      )
    }

    await Promise.all(promises)
  }
}


const ManageInverters = Factory
  .compose(Log)

  .setLogId('manageInverters')

  .init(({
    timeout = required('timeout'),
  }, {instance}) => {
    instance.runningInverters = {}
    instance.timeout = timeout * 1000

    const discoverInverters = async () => {
      try {
        instance.log.trace(`Try to discover your inverters for ${instance.timeout} seconds.`)

        const foundInverters = await DiscoverInverters({
          timeout: instance.timeout,
        })

        if (foundInverters.length === 0) {
          instance.log.error('No GoodWe inverters were found in your LAN. Maybe try again.')
        }

        instance.log.trace('found inverters: %o', foundInverters)
        instance.addInverters(foundInverters)
      } catch (e) {
        if (e.type === 'OPERATIONAL_ERROR') {
          instance.log.warn('skipping error: %o', e)
        } else {
          throw e
        }
      } finally {
        setTimeout(discoverInverters, 30000)
      }
    }

    discoverInverters()

    return instance
  })

  .methods({
    addInverters (foundInverters) {
      for (const {ip} of foundInverters) {
        if (!this.runningInverters[ip]) {
          this.log.trace('add new found inverter with ip %s', ip)
          this.runningInverters[ip] = true
          this.runInverter(ip)
        } else {
          this.log.trace('an inverter with ip %s is already running => skip', ip)
        }
      }
    },

    async runInverter (ip) {
      this.log.trace('runInverter with ip %s', ip)
      let inverter
      while (true) {
        try {
          if (!inverter) {
            inverter = await DetectInverter.setLogId(ip).create({ // eslint-disable-line no-await-in-loop
              ip,
              port   : 8899,
              timeout: 2000,
            })
          }

          const publishToMqttBroker = createPublisher.call(this, inverter)
          let changes = inverter.data
          while (true) {
            await publishToMqttBroker(changes) // eslint-disable-line no-await-in-loop
            await sleep(10000) // eslint-disable-line no-await-in-loop
            changes = await inverter.updateChanges() // eslint-disable-line no-await-in-loop
          }
        } catch (e) {
          if (e.type === 'OPERATIONAL_ERROR') {
            this.log.warn('retrying after error: %o', e)
          } else {
            throw e
          }
        }
      }
    },
  })


Program
  .version(packageJson.version)
  .option('-t, --timeout <timeout>', 'timeout in seconds to wait for inverters', '2')
  .showHelpAfterError()
  .parse(process.argv)


const Options = Program.opts()
if (isNaN(Options.timeout) || Options.timeout <= 0) {
  throw new Error(`you specified an illegal number for timeout: "${Options.timeout}". It must be a positive integer as seconds.`)
}

ManageInverters({timeout: Options.timeout})
