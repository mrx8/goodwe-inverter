import Factory from 'stampit'
import GetStamp from './get-stamp.mjs'
import InverterBase from './inverter-base.mjs'


export default Factory
  .compose(
    GetStamp,
    InverterBase,
  )

  .methods({
    async getBatteryData (registerStart, registerCount) {
      const {BatteryDataParser} = this.getStampConfiguration()
      const responseMessage = await this.readMessage({
        registerStart,
        registerCount,
      })

      return BatteryDataParser({
        message: responseMessage,
        registerStart,
      })
    },
  })
