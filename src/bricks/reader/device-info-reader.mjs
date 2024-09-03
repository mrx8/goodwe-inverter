import Factory from 'stampit'
import ReadMessage from './network/read-message.mjs'


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

      let initWasCalledOnce = false

      return Factory
        .init(async (param, {instance: instancePromise}) => {
          const instance = await instancePromise
          if (initWasCalledOnce === false) {
            initWasCalledOnce = true

            const responseMessage = await reader.readMessage({
              registerStart,
              registerCount,
            })

            Object.assign(instance, Parser({
              message: responseMessage,
              registerStart,
            }).getData())
          }

          return instance
        })
    },
  })
