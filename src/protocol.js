'use strict'

const Factory = require('stampit')


module.exports = Factory
  .configuration({
    dgram         : require('node:dgram'),
    defaultIp     : '127.0.0.1',
    defaultPort   : require('./constants').GOODWE_UDP_PORT,
    defaultTimeout: 3000,
    maxRetries    : 5,
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
      maxRetries,
    }}},

    instance: instancePromise,
  }) => {
    const instance = await instancePromise
    const [ip, port] = address.split(':')
    instance.ip = ip || defaultIp
    instance.port = port || defaultPort
    instance.timeout = timeout || defaultTimeout
    instance.maxRetries = maxRetries

    const client = dgram.createSocket('udp4')
    client.unref()
    instance.client = client

    return instance
  })


  .methods({
    async requestResponse (message) {
      let error
      for (let i = 0; i < this.maxRetries; i++) {
        try {
          const result = await new Promise((resolve, reject) => { // eslint-disable-line no-await-in-loop
            let timeoutId // eslint-disable-line prefer-const

            const receiver = (data, rinfo) => {
              clearTimeout(timeoutId)
              resolve({
                rinfo,
                data,
              })
            }
            this.client.once('message', receiver)

            timeoutId = setTimeout(() => {
              this.client.removeListener('message', receiver)
              const error = new Error('request timed out')
              error.code = 'REQUEST_TIMED_OUT'
              reject(error)
            }, this.timeout)


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
            console.log('retry', i)
            error = e
          } else {
            throw e
          }
        }
      }

      throw error
    },
  })
