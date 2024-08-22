import {GOODWE_BROADCAST_PORT} from './constants.mjs'
import Protocol from './protocol.mjs'


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


export default Protocol
  .init(async ({
    request,
    timeout = 3000,
  }, {
    instance: instancePromise,
  }) => {
    const instance = await instancePromise
    await bind(instance.client, 0)
    instance.client.setBroadcast(true)

    return new Promise((resolve, reject) => {
      const responses = []
      const receiver = (data, rinfo) => {
        if (rinfo.port === GOODWE_BROADCAST_PORT) {
          const [ip, macAdressRaw, ssid] = data.toString().split(',')
          if (ssid.startsWith('Solar-WiFi')) {
            const macAdress = macAdressRaw.match(/.{2}/g).join(':')
            responses.push({
              ip,
              macAdress,
              ssid,
            })
          }
        }
      }

      instance.client.on('message', receiver)

      const timeoutId = setTimeout(() => {
        instance.client.removeListener('message', receiver)
        resolve(responses)
      }, timeout)

      instance.client.send(request, instance.port, instance.ip, err => {
        if (err) {
          clearTimeout(timeoutId)
          reject(err)
        }
      })
    })
  })
