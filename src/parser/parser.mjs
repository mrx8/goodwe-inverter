import Factory from 'stampit'


export default Factory
  .init(({
    message,
    registerOffset = 0,
  }, {instance}) => {
    instance.message = message
    instance.registerOffset = registerOffset

    return instance
  })


  .methods({
    getIndexFromRegister (register) {
      const index = (register - this.registerOffset) * 2
      if (index < 0) {
        throw new Error('register index is negative', 'CONFIG_ERROR')
      }

      return index
    },
  })
