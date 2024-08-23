#!/usr/bin/env node
import Discover from '../src/discover.mjs'
import {program as Program} from 'commander'
import {createRequire} from 'module'

// import packageJson from '../package.json' with { type: "json" }
const require = createRequire(import.meta.url)
const packageJson = require('../package.json')

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
  timeout,
})

console.log(`Try to discover your inverters for ${Options.timeout} seconds.`)

if (foundInverters.length === 0) {
  console.error('No GoodWe inverters were found in your LAN. Maybe try again.')
  process.exit(1)
}

console.log(foundInverters)
