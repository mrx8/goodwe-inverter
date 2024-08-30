import Factory from 'stampit'
import GetStamp from './get-stamp.mjs'
import InverterBase from './inverter-base.mjs'

export default Factory
  .compose(
    GetStamp,
    InverterBase,
  )

  .methods({
    async getDeviceInfo (registerStart, registerCount) {
      const {DeviceInfoParser} = this.getStampConfiguration()

      const responseMessage = await this.readMessage({
        registerStart,
        registerCount,
      })

      return DeviceInfoParser({
        message: responseMessage,
        registerStart,
      })
    },
  })
