import Factory from 'stampit'


function readUInt16BE (message, offset) {
  let value = message.readUInt16BE(offset)
  if (value === 65535) {
    value = 0
  }

  return value
}


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


    readTimestamp (register) {
      const index = this.getIndexFromRegister(register)

      const year = 2000 + this.message[index]
      const month = this.message[index + 1]
      const day = this.message[index + 2]
      const hour = this.message[index + 3]
      const minute = this.message[index + 4]
      const second = this.message[index + 5]
      console.log(year, month, day, hour, minute, second)

      return new Date(year, month, day, hour, minute, second)
    },


    readVoltage (register) {
      const index = this.getIndexFromRegister(register)
      const value = readUInt16BE(this.message, index)

      return value / 10
    },


    readCurrent (register) {
      return this.readVoltage(register)
    },
  })
