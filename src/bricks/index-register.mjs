import Factory from 'stampit'


export default Factory
  .init(({
    registerStart = 0,
  }, {instance}) => {
    instance.registerStart = registerStart

    return instance
  })


  .methods({
    _getIndexFromRegister (register) {
      const index = (register - this.registerStart) * 2
      if (index < 0) {
        throw new Error('register index is negative', 'CONFIG_ERROR')
      }

      return index
    },
  })
