'use strict'

function RequestFailedException (message = '', consecutiveFailuresCount = 0) {
  const exception = new Error(message)

  exception.code = 'REQUEST_FAILED'
  exception.consecutiveFailuresCount = consecutiveFailuresCount

  return exception
}


function RequestRejectedException (code = 'UNKNOWN') {
  const exception = new Error('request rejected')

  exception.code = code

  return exception
}


function PartialResponseException (length, expected) {
  const exception = new Error('partial response')

  exception.code = 'PARTIAL_RESPONSE'
  exception.length = length
  exception.expected = expected

  return exception
}


function MaxRetriesException (message = 'max retries reached') {
  const exception = new Error(message)

  exception.code = 'MAX_RETRIES_REACHED'

  return exception
}


module.exports = {
  RequestFailedException,
  RequestRejectedException,
  PartialResponseException,
  MaxRetriesException,
}
