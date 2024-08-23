import Protocol from './protocol.mjs'


export default Protocol
  .init(async (param, {
    instance: instancePromise,
  }) => {
    const instance = await instancePromise
    instance.interface = 'DT'

    return instance
  })
