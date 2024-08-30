import Factory from 'stampit'
import {GOODWE_UDP_PORT} from './constants.mjs'
import Log from './log.mjs'
import {ProgrammerError} from './error.mjs'
import dgram from 'node:dgram'


export default Factory
  .configuration({
    dgram         : dgram,
    defaultIp     : '127.0.0.1',
    defaultPort   : GOODWE_UDP_PORT,
    defaultTimeout: 2000,
    maxTries      : 2,
  })


  .init(async ({
    address = ':',
    timeout,
  } = {}, {
    stamp: {compose: {configuration: {
      dgram,
      defaultIp,
      defaultPort,
      defaultTimeout,
      maxTries,
    }}},

    instance: instancePromise,
  }) => {
    const instance = await instancePromise
    const [ip, port] = address.split(':')
    instance.ip = ip || defaultIp
    instance.port = port || defaultPort
    instance.timeout = timeout || defaultTimeout
    instance.maxTries = maxTries

    const client = dgram.createSocket('udp4')
    client.unref()
    instance.client = client

    return instance
  })


  .methods({
    async requestResponse (message) {
      let error
      for (let i = 1; i <= this.maxTries; i++) {
        Log.trace('request try #%d/%d', i, this.maxTries)
        try {
          const result = await new Promise((resolve, reject) => { // eslint-disable-line no-await-in-loop
            let timeoutId // eslint-disable-line prefer-const

            const receiver = (message, rinfo) => {
              clearTimeout(timeoutId)
              Log.trace('received %d bytes length message %s from %s:%d', message.length, message.toString('hex'), rinfo.address, rinfo.port)
              resolve(message)
            }
            this.client.once('message', receiver)

            timeoutId = setTimeout(() => {
              this.client.removeListener('message', receiver)
              const error = new ProgrammerError('request timed out', 'ERROR_TIMED_OUT')
              error.code = 'REQUEST_TIMED_OUT'
              reject(error)
            }, this.timeout)

            Log.trace('send %d bytes length message %s to %s:%d', message.length, message.toString('hex'), this.ip, this.port)
            this.client.send(message, this.port, this.ip, err => {
              if (err) {
                clearTimeout(timeoutId)
                reject(err)
              }
            })
          })

          return result
        } catch (e) {
          if (e.code === 'REQUEST_TIMED_OUT') {
            error = e
          } else {
            throw e
          }
        }
      }
      Log.trace('request failed with %s', error.code)

      throw error
    },
  })
