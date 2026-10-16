import Factory from 'stampit'
import ObjectAssignDeep from 'object-assign-deep'
import ReadMessage from './network/read-message.mjs'


async function readRegisterBlock (instance, readerData) {
  const {
    reader,
    registerStart,
    registerCount,
    Sensors,
  } = readerData

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
      readerData.numberOfCalls++

      return
    } catch (e) {
      error = e
      // timeouts are expected when an inverter is switched off (e.g. at night), the caller logs the final error
      reader.log[e.code === 'REQUEST_TIMED_OUT' ? 'debug' : 'warn'](e)
    }
  }
  throw error
}


// The same initializer for every reader, so a composed ReadDataFactory has it only once (stampit removes duplicates).
// It reads the blocks of all composed readers one after another and stops at the first block which fails.
async function readRegisters (param, {
  instance,
  stamp,
}) {
  for (const readerData of stamp.compose.deepConfiguration.readers) {
    if (readerData.numberOfCalls < readerData.maxCalls) {
      await readRegisterBlock(instance, readerData) // eslint-disable-line no-await-in-loop
    }
  }

  return instance
}


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

      // every reader carries its data with it. deepConfiguration and not configuration: on compose the arrays of all
      // readers are concatenated (in the order of composition), while configuration would keep only the last reader.
      return Factory
        .deepConfiguration({
          readers: [
            {
              reader,
              registerStart,
              registerCount,
              Sensors,
              maxCalls     : this.compose?.configuration?.maxCalls ?? Infinity,
              numberOfCalls: 0,
            },
          ],
        })

        .init(readRegisters)
    },
  })
