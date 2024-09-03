import Factory from 'stampit'
import ReadMessage from './read-message.mjs'


export default Factory
  .statics({
    async setup ({
      ip,
      port,
      address,
      registerStart,
      registerCount,
      Parser,
    }) {
      const reader = await ReadMessage({
        ip,
        port,
        address,
      })

      return Factory
        .init(async (param, {instance: instancePromise}) => {
          const instance = await instancePromise

          const responseMessage = await reader.readMessage({
            registerStart,
            registerCount,
          })

          Object.assign(instance, Parser({
            message: responseMessage,
            registerStart,
          }).getData())

          return instance
        })
    },
  })
