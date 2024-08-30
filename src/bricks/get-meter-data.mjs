import Factory from 'stampit'
import GetStamp from './get-stamp.mjs'
import InverterBase from './inverter-base.mjs'


export default Factory
  .compose(
    GetStamp,
    InverterBase,
  )

  .methods({
    async getMeterData (registerStart, registerCount) {
      const {MeterDataParser} = this.getStampConfiguration()
      const responseMessage = await this.readMessage({
        registerStart,
        registerCount,
      })

      return MeterDataParser({
        message: responseMessage,
        registerStart,
      })
    },
  })
