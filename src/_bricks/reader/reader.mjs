import Factory from 'stampit'
import ReadMessage from './network/read-message.mjs'

export default Factory
  .statics({
    setup ({
      ip,
      port,
      timeout,
      address,
      registerStart,
      registerCount,
      Sensors,
    }) {
      const reader = ReadMessage
        .setLogId(this.compose?.configuration?.logId || ip)

        .create({
          ip,
          port,
          timeout,
          address,
        })

      return Factory
        .configuration({
          numberOfCalls: 0,
          maxCalls     : Infinity,
        })

        .init(async (param, {
          instance: instancePromise,
          stamp:{compose:{configuration: {
            maxCalls,
          }}},
          stamp,
        }) => {
          if (maxCalls === Infinity || stamp.compose.configuration.numberOfCalls < maxCalls) {
            let retries = 10
            let error
            while (retries-- > 0) {
              try {
                const responseMessage = await reader.readMessage({ // eslint-disable-line no-await-in-loop
                  registerStart,
                  registerCount,
                })

                const sensorData = Sensors({
                  message: responseMessage,
                  registerStart,
                }).data

                const instance = await instancePromise // eslint-disable-line no-await-in-loop
                Object.assign(instance, sensorData)

                stamp.compose.configuration.numberOfCalls++

                return instance
              } catch (e) {
                error = e
                reader.log.error(e)
              }
            }
            throw error
          }

          return instancePromise
        })
    },
  })
