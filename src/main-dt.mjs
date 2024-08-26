import Inverter from './inverter-dt.mjs'
import {program as Program} from 'commander'
import {inspect} from 'node:util'

Program
  .requiredOption('-i, --ip <ip>', 'ip of the inverter to connect to')
  .showHelpAfterError()
  .parse(process.argv)


const Options = Program.opts()
const inverter = await Inverter({address: Options.ip})
console.log(inspect(inverter, {depth: Infinity}))
