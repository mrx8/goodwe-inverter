#!/usr/bin/env node
import DetectInverter from '../src/inverter/detect.mjs'
import DiscoverInverters from '../src/inverter/discover.mjs'
import {program as Program} from 'commander'
import {createRequire} from 'module'

// import packageJson from '../package.json' with { type: "json" }
const require = createRequire(import.meta.url)
const packageJson = require('../package.json')

Program
  .version(packageJson.version)
  .option('-t, --timeout <timeout>', 'timeout in seconds to wait for inverters', '2')
  .showHelpAfterError()
  .parse(process.argv)


const Options = Program.opts()
if (isNaN(Options.timeout) || Options.timeout <= 0) {
  throw new Error(`you specified an illegal number for timeout: "${Options.timeout}". It must be a positive integer.`)
}

console.log(`Try to discover your inverters for ${Options.timeout} seconds...`)

const foundInverters = await DiscoverInverters({
  timeout: Options.timeout * 1000,
})

if (foundInverters.length === 0) {
  console.error('No GoodWe inverters were found in your LAN. Maybe try again.')
  process.exit(1)
}

console.log('found', foundInverters.length, 'inverters')
let count = 0
for (const foundInverter of foundInverters) {
  console.log('--------------------------------------------')
  console.log(`inverter #${++count}:`)
  console.log(foundInverter)
  console.log('Now try to detect this inverter on ip', foundInverter.ip, '...')
  try {
    const inverter = await DetectInverter.setLogId(foundInverter.ip).create({ // eslint-disable-line no-await-in-loop
      detectOnly: true,
      ip        : foundInverter.ip,
      port      : 8899,
      timeout   : 5000,
    })
    console.log('Sucessfully detected the inverter on ip:', foundInverter.ip)
    console.log(inverter.data.deviceInfo)
  } catch (e) {
    console.log('got an error detecting inverter on ip', foundInverter.ip, e)
  }
}
