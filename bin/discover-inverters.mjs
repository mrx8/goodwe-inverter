#!/usr/bin/env node
import {program as Program} from 'commander'
import Discover from '../src/discover.mjs'
import Inverter from '../src/inverter.mjs'
import packageJson from '../package.json' with { type: "json" }


Program
  .version(packageJson.version)
  .option('-t, --timeout <timeout>', 'timeout to wait for inverters', '3')
  .showHelpAfterError()
  .parse(process.argv)


const Options = Program.opts()
if (isNaN(Options.timeout) || Options.timeout <= 0) {
  throw new Error(`you specified an illegal number for timeout: "${Options.timeout}". It must be a positive integer.`)
}
const timeout = Options.timeout * 1000

const foundInverters = await Discover({
  address: '255.255.255.255:48899',
  request: Buffer.from('WIFIKIT-214028-READ'),
  timeout,
})

console.log(`Try to discover your inverters for ${Options.timeout} seconds.`)

if (foundInverters.length === 0) {
  console.error('No GoodWe inverters were found in your LAN. Maybe try again.')
  process.exit(1)
}

console.log('res', foundInverters)
for (const {ip} of foundInverters) {
  console.log(`check ${ip}`)
  const inverter = await Inverter({address: ip}) // eslint-disable-line no-await-in-loop
  try {
    const response = await inverter.getDeviceInfo() // eslint-disable-line no-await-in-loop
    console.log(response, response.data.toString())
  } catch (e) {
    if (e.code !== 'REQUEST_TIMED_OUT') {
      throw e
    }
  }
}
