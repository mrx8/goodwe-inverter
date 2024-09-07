import Factory from 'stampit'
import Log from '../shared/log.mjs'
import Network from '../_bricks/reader/network/network.mjs'


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
  .init((param = {}) => {
    param.ip = GOODWE_BORADCAST_IP
    param.port = GOODWE_BROADCAST_PORT
    param.timeout = Timeout
  })

  .compose(
    Log,
    Network,
  )

  .setLogId('discoverInverter')

  .init(async (param, {
    instance: instancePromise,
  }) => {
    const instance = await instancePromise
    instance.log.trace('setup UDP-socket for receiving multicast')
    await bind(instance.client, 0)
    instance.client.setBroadcast(true)
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

      instance.client.on('message', receiver)

      const timeoutId = setTimeout(() => {
        instance.client.removeListener('message', receiver)
        resolve(responses)
      }, instance.timeout)

      const request = Buffer.from('WIFIKIT-214028-READ')
      instance.log.trace('send message %s to %s:%s', request.toString(), instance.ip, instance.port)
      instance.client.send(request, instance.port, instance.ip, err => {
        if (err) {
          clearTimeout(timeoutId)
          reject(err)
        }
      })
    })
  })
