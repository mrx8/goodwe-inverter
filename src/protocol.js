'use strict'

const Factory = require('stampit')


module.exports = Factory
  .configuration({
    dgram      : require('node:dgram'),
    defaultIp  : '127.0.0.1',
    defaultPort: require('./constants').GOODWE_UDP_PORT,
  })


  .init(async ({
    address = ':',
  } = {}, {
    stamp: {compose: {configuration: {
      dgram,
      defaultIp,
      defaultPort,
    }}},

    instance: instancePromise,
  }) => {
    const instance = await instancePromise
    const [ip, port] = address.split(':')
    instance.ip = ip || defaultIp
    instance.port = port || defaultPort

    const client = dgram.createSocket('udp4')
    client.unref()
    instance.client = client

    return instance
  })


  .methods({
    requestResponse (message) {
      return new Promise((resolve, reject) => {
        this.client.once('message', (data, rinfo) => {
          resolve({
            rinfo,
            data,
          })
        })

        this.client.send(message, this.port, this.ip, err => {
          if (err) {
            reject(err)
          }
        })
      })
    },
  })
