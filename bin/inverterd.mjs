#!/usr/bin/env node
import DetectInverter from '../src/inverter/detect.mjs'
import DiscoverInverters from '../src/inverter/discover.mjs'
import Log from '../src/shared/log.mjs'
import Mqtt from 'mqtt'
import {program as Program} from 'commander'
import {createRequire} from 'module'
import {setTimeout as sleep} from 'node:timers/promises'

const require = createRequire(import.meta.url)
const packageJson = require('../package.json')

const client = await Mqtt.connectAsync('mqtt://192.168.30.5:1884')


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

  return async function publishToMqttBroker (data) {
    const promises = []
    const mqttPath = `goodwe.inverters.${serialNumber}`

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


async function runInverter (ip) {
  Log.trace('runInverter with ip %s', ip)
  let inverter
  while (true) {
    try {
      if (!inverter) {
        inverter = await DetectInverter.from({ // eslint-disable-line no-await-in-loop
          ip,
          port   : 8899,
          timeout: 2000,
        })
      }

      const publishToMqttBroker = createPublisher(inverter)
      let changes = inverter.data
      while (true) {
        await publishToMqttBroker(changes) // eslint-disable-line no-await-in-loop
        await sleep(10000) // eslint-disable-line no-await-in-loop
        changes = await inverter.updateChanges() // eslint-disable-line no-await-in-loop
      }
    } catch (e) {
      if (e.type === 'OPERATIONAL_ERROR') {
        Log.warn('retrying after error: %o', e)
      } else {
        throw e
      }
    }
  }
}


Program
  .version(packageJson.version)
  .option('-t, --timeout <timeout>', 'timeout in seconds to wait for inverters', '2')
  .showHelpAfterError()
  .parse(process.argv)


const Options = Program.opts()
if (isNaN(Options.timeout) || Options.timeout <= 0) {
  throw new Error(`you specified an illegal number for timeout: "${Options.timeout}". It must be a positive integer as seconds.`)
}

Log.trace(`Try to discover your inverters for ${Options.timeout} seconds.`)

const foundInverters = await DiscoverInverters({
  timeout: Options.timeout * 1000,
})


if (foundInverters.length === 0) {
  Log.error('No GoodWe inverters were found in your LAN. Maybe try again.')
  await sleep(2000)
  process.exit(1)
}

Log.trace('found inverters: %o', foundInverters)

for (const {ip} of foundInverters) {
  runInverter(ip)
}
