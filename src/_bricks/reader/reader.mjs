import Factory from 'stampit'
import ObjectAssignDeep from 'object-assign-deep'
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

      // counted here and not in the stamp-configuration: all readers composed into one ReadDataFactory share its configuration
      const maxCalls = this.compose?.configuration?.maxCalls ?? Infinity
      let numberOfCalls = 0

      return Factory
        .init(async (param, {
          instance: instancePromise,
        }) => {
          // wait for the previous reader first: its rejection is handled at once and passed on without reading again
          const instance = await instancePromise
          if (numberOfCalls >= maxCalls) {
            return instance
          }

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

              ObjectAssignDeep(instance, sensorData) // deep: several readers may fill the same group (e.g. settingsData)
              numberOfCalls++

              return instance
            } catch (e) {
              error = e
              // timeouts are expected when an inverter is switched off (e.g. at night), the caller logs the final error
              reader.log[e.code === 'REQUEST_TIMED_OUT' ? 'debug' : 'warn'](e)
            }
          }
          throw error
        })
    },
  })
