import Factory from 'stampit'
import Log from '../shared/log.mjs'
import dgram from 'node:dgram'

const GOODWE_BORADCAST_IP = '255.255.255.255'
const GOODWE_BROADCAST_PORT = 48899
const Timeout = 2000


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
    Log,
  )

  .setLogId('discoverInverter')

  .properties({
    ip  : GOODWE_BORADCAST_IP,
    port: GOODWE_BROADCAST_PORT,
  })

  .init(async ({
    timeout = Timeout,
  }, {
    instance: instancePromise,
  }) => {
    const instance = await instancePromise
    instance.timeout = timeout
    instance.log.trace('setup UDP-socket for receiving multicast')
    const client = dgram.createSocket('udp4')
    client.unref()

    await bind(client, 0)
    client.setBroadcast(true)
    instance.log.trace('bound and listen for broadcast on UDP-socket')

    return new Promise((resolve, reject) => {
      const responses = []
      const receiver = (data, rinfo) => {
        if (rinfo.port === GOODWE_BROADCAST_PORT) {
          const [ip, macAdressRaw, name] = data.toString().split(',')
          if (name.startsWith('Solar-WiFi')) {
            const macAdress = macAdressRaw.match(/.{2}/g).join(':')
            instance.log.trace('got multicast-answer from ip: %s, mac-address: %s, name: %s', ip, macAdress, name)
            responses.push({
              ip,
              macAdress,
              name,
            })
          }
        }
      }

      client.on('message', receiver)

      const timeoutId = setTimeout(() => {
        client.removeListener('message', receiver)
        resolve(responses)
      }, instance.timeout)

      const request = Buffer.from('WIFIKIT-214028-READ')
      instance.log.trace('send message %s to %s:%s', request.toString(), instance.ip, instance.port)
      client.send(request, instance.port, instance.ip, err => {
        if (err) {
          clearTimeout(timeoutId)
          reject(err)
        }
      })
    })
  })
