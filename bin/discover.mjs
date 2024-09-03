import Factory from 'stampit'
import Network from '../src/_bricks/reader/network/network.mjs'
import Log from '../src/shared/log.mjs'


function bind (socket, port = 0) {
  return new Promise((resolve, reject) => {
    socket.bind({
      port,
    }, err => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}


export default Factory
  .compose(
    Network,
  )

  .configuration({
    GOODWE_BROADCAST_PORT: 48899,
  })

  .init(async ({
    timeout = 2000,
  }, {
    instance: instancePromise,
    stamp: {compose: {configuration: {
      GOODWE_BROADCAST_PORT,
    }}},
  }) => {
    const instance = await instancePromise
    Log.trace('bind udp socket')
    await bind(instance.client, 0)
    Log.trace('listen for broadcast on udp socket')
    instance.client.setBroadcast(true)

    return new Promise((resolve, reject) => {
      const responses = []
      const receiver = (data, rinfo) => {
        if (rinfo.port === GOODWE_BROADCAST_PORT) {
          const [ip, macAdressRaw, name] = data.toString().split(',')
          if (name.startsWith('Solar-WiFi')) {
            const macAdress = macAdressRaw.match(/.{2}/g).join(':')
            Log.trace('got answer from %s %s %s', ip, macAdress, name)
            responses.push({
              ip,
              macAdress,
              name,
            })
          }
        }
      }

      instance.client.on('message', receiver)

      const timeoutId = setTimeout(() => {
        instance.client.removeListener('message', receiver)
        resolve(responses)
      }, timeout)

      const request = Buffer.from('WIFIKIT-214028-READ')
      Log.trace('send message %s to %s:%s', request.toString(), instance.ip, instance.port)
      instance.client.send(request, instance.port, instance.ip, err => {
        if (err) {
          clearTimeout(timeoutId)
          reject(err)
        }
      })
    })
  })
