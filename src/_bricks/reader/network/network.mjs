import Factory from 'stampit'
import Log from '../../../shared/log.mjs'
import {ProgrammerError} from '../../../shared/error.mjs'
import dgram from 'node:dgram'


export default Factory
  .configuration({
    dgram: dgram,
    log  : Log,
  })


  .init(async ({
    ip = '127.0.0.1',
    port = 8899,
    timeout = 2000,
  } = {}, {
    stamp: {compose: {configuration: {
      dgram,
      log,
    }}},

    instance: instancePromise,
  }) => {
    const instance = await instancePromise
    instance.ip = ip
    instance.port = port
    instance.timeout = timeout
    instance.log = log
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
          this.log.trace('received %d bytes length message %s from %s:%d', message.length, message.toString('hex'), rinfo.address, rinfo.port)
          resolve(message)
        }
        this.client.once('message', receiver)

        timeoutId = setTimeout(() => {
          this.client.removeListener('message', receiver)
          reject(new ProgrammerError('request timed out', 'REQUEST_TIMED_OUT'))
        }, this.timeout)

        this.log.trace('send %d bytes length message %s to %s:%d', message.length, message.toString('hex'), this.ip, this.port)
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
