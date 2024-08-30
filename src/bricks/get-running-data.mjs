import Factory from 'stampit'
import GetStamp from './get-stamp.mjs'
import InverterBase from './inverter-base.mjs'


export default Factory
  .compose(
    GetStamp,
    InverterBase,
  )

  .methods({
    async getRunningData (registerStart, registerCount) {
      const {RunningDataParser} = this.getStampConfiguration()
      const responseMessage = await this.readMessage({
        registerStart,
        registerCount,
      })

      return RunningDataParser({
        deviceInfo: this.deviceInfo,
        message   : responseMessage,
        registerStart,
      })
    },
  })
