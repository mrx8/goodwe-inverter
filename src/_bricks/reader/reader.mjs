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
      const reader = ReadMessage.setLogId(this.compose?.configuration?.logId || ip).create({
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
            const responseMessage = await reader.readMessage({
              registerStart,
              registerCount,
            })

            const sensorData = Sensors({
              message: responseMessage,
              registerStart,
            }).data

            const instance = await instancePromise
            Object.assign(instance, sensorData)

            stamp.compose.configuration.numberOfCalls++

            return instance
          }

          return instancePromise
        })
    },
  })
