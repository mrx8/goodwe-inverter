import {program as Program} from 'commander'
import ReadMessage from './_bricks/reader/network/read-message.mjs'
import {inspect} from 'node:util'

Program
  .requiredOption('-i, --ip <ip>', 'ip of the inverter to connect to')
  .requiredOption('-p, --port <port>', 'port of the inverter to connect to')
  .requiredOption('-t, --timeout <seconds>', 'timeout for network-actions')
  .requiredOption('-a, --address <address-code>', 'address-code for the inverter')
  .requiredOption('-r, --register <registerId>', 'register to read')
  .option('-c, --registerCount <registerCount>', 'number of registers to read', 1)
  .requiredOption('-s, --sensorModule <sensor-module>', 'name of the sensor-module')
  .requiredOption('-m, --method <sensor-method>', 'name of the sensor-method')
  .option('-d, --additional <additional-param>', 'additional-param for sensor-method')
  .showHelpAfterError()
  .parse(process.argv)


const Options = Program.opts()

const reader = ReadMessage.setLogId('manual-read').create({
  ip     : Options.ip,
  port   : Number(Options.port),
  timeout: Options.timeout,
  address: Number(Options.address),
})

const message = await reader.readMessage({
  registerStart: Number(Options.register),
  registerCount: Number(Options.registerCount),
})

const {default: Sensor} = await import(`./_bricks/sensors/read-${Options.sensorModule}.mjs`)
const sensor = Sensor({
  registerStart: Number(Options.register),
  message,
})[Options.method](Number(Options.register), Number(Options.additional))

console.log('sensor:', inspect(sensor, {depth: Infinity, maxArrayLength: Infinity, maxStringLength: Infinity}))
