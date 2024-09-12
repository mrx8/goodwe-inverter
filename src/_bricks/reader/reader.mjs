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
        })

        .init(async (param, {
          instance: instancePromise,
          stamp:{compose:{configuration: {
            maxCalls = Infinity,
          }}},
          stamp,
        }) => {
          const instance = await instancePromise
          if (maxCalls === Infinity || stamp.compose.configuration.numberOfCalls < maxCalls) {
            const responseMessage = await reader.readMessage({
              registerStart,
              registerCount,
            })

            Object.assign(instance, Sensors({
              message: responseMessage,
              registerStart,
            }).getData())

            stamp.compose.configuration.numberOfCalls++
          }

          return instance
        })
    },
  })
