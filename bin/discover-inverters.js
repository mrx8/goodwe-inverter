'use strict'

const Program = require('commander')
const Discover = require('../src/discover')
const Inverter = require('../src/inverter')


async function main () {
  Program
    .version(require('../package.json').version)
    .option('-t, --timeout <timeout>', 'timeout to wait for inverters', '3')
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
  process.exit(0)
}


main()
  .catch(e => {
    console.error(e.message)
    Program.help()
    process.exit(1)
  })
