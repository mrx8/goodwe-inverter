#!/usr/bin/env node
import DetectInverter from '../src/inverter/detect.mjs'
import DiscoverInverters from '../src/inverter/discover.mjs'
import {EventEmitter} from 'node:events'
import Factory from 'stampit'
import Log from '../src/shared/log.mjs'
import Mqtt from 'mqtt'
import {program as Program} from 'commander'
import {createRequire} from 'node:module'
import {inspect} from 'node:util'
import {required} from '../src/shared/required.mjs'
import {setTimeout as sleep} from 'node:timers/promises'

const require = createRequire(import.meta.url)
const packageJson = require('../package.json')
const MQTT_BASE_PATH = 'goodwe.inverters'
// comma-separated ip- or mac-addresses of inverters which must not be used, e.g. "28:9c:6e:0a:1b:2c,192.168.1.50"
const IGNORE_INVERTERS = (process.env.IGNORE_INVERTERS || '').split(',').map(entry => entry.trim()).filter(Boolean)

let client
const MQTT_URI = process.env.MQTT_URI || null
if (MQTT_URI === null) {
  client = {
    publishAsync (path, value) {
      console.log(`${path} => ${value}`)
    },
    subscribeAsync () {},
    on () {},
  }
} else {
  const {log} = Log.setLogId('mqtt')()
  while (!client) {
    try {
      client = await Mqtt.connectAsync(MQTT_URI) // eslint-disable-line no-await-in-loop
    } catch (e) { // e.g. while the host is booting and the broker is not running yet
      log.warn('cannot connect to the mqtt-broker, retry in 10s: %s', e.code || e.message)
      await sleep(10000) // eslint-disable-line no-await-in-loop
    }
  }
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
    const mqttPath = `${MQTT_BASE_PATH}.${serialNumber}`
    this.log.trace('publish sensors with path %s to mqtt', mqttPath)
    for (const [path, value] of recursiveIterate(mqttPath, data)) {
      promises.push(
        client.publishAsync(path, value, {retain: true}),
      )
    }

    await Promise.all(promises)
  }
}


async function createSubscriber (inverter) {
  const serialNumber = inverter.data.deviceInfo.serialNumber
  const mqttPath = `${MQTT_BASE_PATH}.${serialNumber}`
  const states = inverter.getWriteableStates()

  const topics = []
  for (const state of states) { // only subscribe if the inverter has configured any.
    const topic = `${mqttPath}.${state}`
    this.log.trace('setup subscribe on topic "%s"', topic)
    topics.push(topic)

    let lastElement = state.split('.').pop()
    lastElement = `${lastElement.charAt(0).toUpperCase()}${lastElement.slice(1)}`

    let numberOfMessages = 0
    this.emitter.on(topic, async message => {
      // on subscribe to a topic the mqtt-broker is sending the current state (configured by me in the mqtt-instance in iobroker)
      // afterwards we read the current value from the inverter and publish them to the mqtt-broker, which resends it to us.
      // afterwards this won't happen anymore because of the {nl: true}-flag below in subscribeAsync().
      if (numberOfMessages < 2) {
        numberOfMessages++
        this.log.trace('dropping message number %d for topic "%s"', numberOfMessages, topic)

        return
      }

      try {
        message = message.toString()
        this.log.trace('subscribe: received data from topic "%s" with message "%s"', topic, message)
        const methodName = `write${lastElement}`
        this.log.trace('subscribe: invoking inverter.%s(%s)', methodName, message)
        await inverter[methodName](message)
        this.log.trace('subscribe: invoke successful')
        await client.publishAsync(topic, message)
        this.log.trace('subscribe: ack send back')
      } catch (e) {
        this.log.error('subscribe: error in handling received data from topic %s with message %s: %s', topic, message, inspect(e))
      }
    })
  }

  if (topics.length > 0) {
    await client.subscribeAsync(topics, {nl: true})
  }
}


const ManageInverters = Factory
  .compose(Log)

  .setLogId('manageInverters')

  .init(({
    timeout = required('timeout'),
  }, {instance}) => {
    instance.emitter = new EventEmitter()
    client.on('message', (topic, message) => {
      instance.emitter.emit(topic, message)
    })

    instance.runningInverters = {}
    instance.timeout = timeout * 1000
    if (IGNORE_INVERTERS.length > 0) {
      instance.log.info('ignore inverters: %s', IGNORE_INVERTERS.join(', '))
    }

    const discoverInverters = async () => {
      try {
        instance.log.trace(`Try to discover your inverters for ${instance.timeout} seconds.`)

        const foundInverters = await DiscoverInverters({
          timeout: instance.timeout,
          ignore : IGNORE_INVERTERS,
        })

        if (foundInverters.length === 0) {
          instance.log.error('No GoodWe inverters were found in your LAN. Maybe try again.')

          return
        }

        instance.log.trace('found inverters: %o', foundInverters)
        instance.addInverters(foundInverters)
      } catch (e) {
        instance.log.warn('skipping error: %s', inspect(e))
      } finally {
        setTimeout(discoverInverters, 60000)
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
      let publishToMqttBroker
      let hadError = false
      let failures = 0

      while (true) {
        try {
          if (!inverter) {
            inverter = await DetectInverter.setLogId(ip).create({ // eslint-disable-line no-await-in-loop
              ip,
              port   : 8899,
              timeout: 5000, // the WiFi-module sometimes answers only after 3.1s
            })
            publishToMqttBroker = createPublisher.call(this, inverter)
            await createSubscriber.call(this, inverter) // eslint-disable-line no-await-in-loop
            hadError = false // publish the complete data of the new detected inverter
          }

          let changes = inverter.data
          while (true) {
            if (hadError === false) { // don't publish the last data if we had an error before
              await publishToMqttBroker(changes) // eslint-disable-line no-await-in-loop
            }
            changes = await inverter.updateChanges() // eslint-disable-line no-await-in-loop
            hadError = false // everything went normal
            if (failures > 0) {
              this.log.info('inverter with ip %s answers again after %d failed attempts', ip, failures)
              failures = 0
            }
          }
        } catch (e) {
          // an error of one inverter (e.g. switched off at night) must not end the process: retry with growing pauses
          hadError = true
          failures++
          const pause = Math.min(15 * 2 ** (failures - 1), 120)
          this.log[e.type === 'OPERATIONAL_ERROR' ? 'warn' : 'error'](
            'inverter with ip %s failed %d times, retry in %ds: %s', ip, failures, pause, inspect(e),
          )
          await sleep(pause * 1000) // eslint-disable-line no-await-in-loop
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
