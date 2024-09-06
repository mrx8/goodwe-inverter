import Factory from 'stampit'
import {required} from './required.mjs'


export default Factory

  .init(async ({
    ip = required('ip'),
    port = required('port'),
    timeout = required('timeout'),
  } = {}, {
    instance: instancePromise,
  }) => {
    const instance = await instancePromise

    instance.ip = ip
    instance.port = port
    instance.timeout = timeout

    return instance
  })
