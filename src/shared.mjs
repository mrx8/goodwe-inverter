import {SINGLE_PHASE_MODELS} from './constants.mjs'


export function determinePhases (serialNumber) {
  for (const model of SINGLE_PHASE_MODELS) {
    if (serialNumber.includes(model)) {
      return 1
    }
  }

  return 3
}
