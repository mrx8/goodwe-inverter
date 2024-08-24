import Inverter from './inverter.mjs'
import {inspect} from 'node:util'


try {
  const inverter = await Inverter.from({address: '192.168.30.203'})
  console.log(inspect(inverter, {depth: Infinity}))
} catch (e) {
  if (e.code !== 'REQUEST_TIMED_OUT') {
    throw e
  }
}
