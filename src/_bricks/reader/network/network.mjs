import Factory from 'stampit'
import Log from '../../../shared/log.mjs'
import {OperationalError} from '../../../shared/error.mjs'
import PQueue from 'p-queue'
import Param from '../../../shared/param.mjs'
import dgram from 'node:dgram'


export default Factory
  .compose(
    Param,
    Log('network'),
  )

  .configuration({
    sockets: new Map(),
  })

  .init((param, {
    instance,
    stamp,
  }) => {
    const socketKey = `${instance.ip}:${instance.port}:${instance.timeout}`

    let socketStruct = stamp.compose.configuration.sockets.get(socketKey)
    if (!socketStruct) {
      const socket = dgram.createSocket('udp4')
      socket.unref()

      socketStruct = {
        socket,
        requestQueue: new PQueue({concurrency: 1}),
      }

      stamp.compose.configuration.sockets.set(socketKey, socketStruct)
    }

    instance.client = socketStruct.socket
    instance.requestQueue = socketStruct.requestQueue

    return instance
  })


  .methods({
    async requestResponse (message) {
      const result = await this.requestQueue.add(async () => {
        const result = await new Promise((resolve, reject) => {
          let timeoutId // eslint-disable-line prefer-const

          const receiver = (message, rinfo) => {
            clearTimeout(timeoutId)
            this.log.trace(
              'received %d bytes length message %s from %s:%d expected for %s:%d',
              message.length, message.toString('hex'), rinfo.address, rinfo.port, this.ip, this.port,
            )
            resolve(message)
          }
          this.client.once('message', receiver)

          timeoutId = setTimeout(() => {
            this.client.removeListener('message', receiver)
            reject(new OperationalError('request timed out', 'REQUEST_TIMED_OUT'))
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
      })

      return result
    },
  })
