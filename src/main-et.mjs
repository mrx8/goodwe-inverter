import Inverter from './inverter/et/inverter.mjs'
import {program as Program} from 'commander'
import {inspect} from 'node:util'

Program
  .option('-i, --ip <ip>', 'ip of the inverter to connect to')
  .option('-p, --port <port>', 'port of the inverter to connect to')
  .showHelpAfterError()
  .parse(process.argv)


const Options = Program.opts()
const inverter = await Inverter({ip: Options.ip, port: Options.port})
// await inverter.update()
console.log('inverter', inspect(inverter, {depth: Infinity, maxArrayLength: Infinity, maxStringLength: Infinity}))
