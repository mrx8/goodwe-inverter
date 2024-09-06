import {ProgrammerError} from './error.mjs'


export const required = function (parameterName) {
  throw new ProgrammerError(`missing parameter '${parameterName}'`)
}
