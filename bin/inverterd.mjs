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

const require = createRequire(import.meta.url)
const packageJson = require('../package.json')
const MQTT_BASE_PATH = 'goodwe.inverters'

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
  client = await Mqtt.connectAsync(process.env.MQTT_URI)
  client.subscribe('')
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
        client.publishAsync(path, value),
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
        client.publishAsync(topic, message),
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
          instance.log.warn('skipping error: %s', inspect(e))
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
      let publishToMqttBroker
      let hadError = false

      while (true) {
        try {
          if (!inverter) {
            inverter = await DetectInverter.setLogId(ip).create({ // eslint-disable-line no-await-in-loop
              ip,
              port   : 8899,
              timeout: 2000,
            })
            publishToMqttBroker = createPublisher.call(this, inverter)
            await createSubscriber.call(this, inverter) // eslint-disable-line no-await-in-loop
          }

          let changes = inverter.data
          while (true) {
            if (hadError === false) { // don't publish the last data if we had an error before
              await publishToMqttBroker(changes) // eslint-disable-line no-await-in-loop
            }
            changes = await inverter.updateChanges() // eslint-disable-line no-await-in-loop
            hadError = false // everything went normal
          }
        } catch (e) {
          if (e.type === 'OPERATIONAL_ERROR') {
            hadError = true // in case of a transient error, remember it here
            this.log.warn('retrying after error: %s', inspect(e))
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
