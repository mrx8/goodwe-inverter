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
    log           : Log,
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
    }}},

    instance: instancePromise,
  }) => {
    const instance = await instancePromise
    const [ip, port] = address.split(':')
    instance.ip = ip || defaultIp
    instance.port = port || defaultPort
    instance.timeout = timeout || defaultTimeout

    const client = dgram.createSocket('udp4')
    client.unref()
    instance.client = client

    return instance
  })


  .methods({
    async requestResponse (message) {
      const result = await new Promise((resolve, reject) => {
        let timeoutId // eslint-disable-line prefer-const

        const receiver = (message, rinfo) => {
          clearTimeout(timeoutId)
          Log.trace('received %d bytes length message %s from %s:%d', message.length, message.toString('hex'), rinfo.address, rinfo.port)
          resolve(message)
        }
        this.client.once('message', receiver)

        timeoutId = setTimeout(() => {
          this.client.removeListener('message', receiver)
          reject(new ProgrammerError('request timed out', 'REQUEST_TIMED_OUT'))
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
    },
  })
