'use strict'

const Protocol = require('./protocol')

module.exports = Protocol
  .methods({
    requestDeviceInfo () {
      return this.requestResponse(Buffer.from('aa55c07f0102000241', 'hex'))
    },
  })
