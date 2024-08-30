import Inverter from './inverter/dt/inverter.mjs'
import {program as Program} from 'commander'
import {inspect} from 'node:util'

Program
  .requiredOption('-i, --ip <ip>', 'ip of the inverter to connect to')
  .showHelpAfterError()
  .parse(process.argv)


const Options = Program.opts()
const inverter = await Inverter({address: Options.ip})
console.log('deviceInfo', inspect(inverter.deviceInfo, {depth: Infinity, maxArrayLength: Infinity, maxStringLength: Infinity}))
console.log('runningData', inspect(inverter.runningData, {depth: Infinity, maxArrayLength: Infinity, maxStringLength: Infinity}))
