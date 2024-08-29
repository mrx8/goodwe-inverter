import Factory from 'stampit'


export default Factory
  .init(({
    message,
  }, {instance}) => {
    instance.message = message

    return instance
  })
