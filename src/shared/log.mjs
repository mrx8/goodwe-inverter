import Factory from 'stampit'
import pino from 'pino'

export default Factory
  .init((param, {
    instance,
    stamp,
  }) => {
    const logId = stamp.compose?.configuration?.logId || 'log'

    instance.log = pino({
      level: process.env.PINO_LOG_LEVEL || 'info',

      mixin () {
        return {logId}
      },
    })

    return instance
  })

  .statics({
    setLogId (logId) {
      return this.configuration({
        logId,
      })
    },
  })
