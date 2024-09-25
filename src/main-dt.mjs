import Inverter from './inverter/dt/inverter.mjs'
import {program as Program} from 'commander'
import {inspect} from 'node:util'

Program
  .requiredOption('-i, --ip <ip>', 'ip of the inverter to connect to')
  .requiredOption('-p, --port <port>', 'port of the inverter to connect to')
  .requiredOption('-t, --timeout <seconds>', 'timeout or network-actions')
  .showHelpAfterError()
  .parse(process.argv)


const Options = Program.opts()
const inverter = await Inverter({ip: Options.ip, port: Options.port, timeout: Options.timeout * 1000})
console.log('inverter', inspect(inverter.data, {depth: Infinity, maxArrayLength: Infinity, maxStringLength: Infinity}))
