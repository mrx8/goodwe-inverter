import Factory from 'stampit'
import {required} from './required.mjs'


export default Factory

  .init(({
    ip = required('ip'),
    port = required('port'),
    timeout = required('timeout'),
  } = {}, {
    instance,
  }) => {
    instance.ip = ip
    instance.port = port
    instance.timeout = timeout

    return instance
  })
