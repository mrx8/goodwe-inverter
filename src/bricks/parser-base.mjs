import Factory from 'stampit'


export default Factory
  .init(({
    message,
    deviceInfo,
  }, {instance}) => {
    instance.message = message
    instance.deviceInfo = deviceInfo

    return instance
  })
