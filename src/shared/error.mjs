export function ProgrammerError (message, code) {
  if ((message ?? undefined) === undefined) {
    message = 'unknown error'
  }

  if ((code ?? undefined) === undefined) {
    code = 'ERROR_UNKNOWN'
  }

  const error = new Error(message)
  error.type = 'PROGRAMMER_ERROR'
  error.code = code

  return error
}


export function OperationalError (message, code) {
  if ((message ?? undefined) === undefined) {
    message = 'unknown error'
  }

  if ((code ?? undefined) === undefined) {
    code = 'ERROR_UNKNOWN'
  }

  const error = new Error(message)
  error.type = 'OPERATIONAL_ERROR'
  error.code = code

  return error
}


export function from (e) {
  if (!(e instanceof Error)) {
    throw new ProgrammerError('error.from() is not an instanceof Error', 'FATAL')
  }

  return new ProgrammerError(e.message, e.code || 'PLAIN_ERROR')
}
