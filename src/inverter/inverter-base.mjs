import {diff as DiffObject} from 'deep-object-diff'
import Factory from 'stampit'
import Log from '../shared/log.mjs'
import Param from '../shared/param.mjs'


export default Factory
  .compose(
    Param,
    Log,
  )

  .setLogId('inverter')

  .init((param, {instance}) => {
    instance.data = {}
  })

  .methods({
    async updateChanges () {
      const data = await this.ReadDataFactory()
      const diff = DiffObject(this.data, data)
      this.data = data

      return diff
    },


    calculateEfficiency ({
      pvPowerTotal,
      powerTotal,
    }) {
      if (pvPowerTotal > 0) {
        const efficiency = Number(
          powerTotal * 100 / pvPowerTotal,
        ).toFixed(2)

        if (efficiency <= 100) {
          return efficiency
        }

        return 100
      }

      return 0
    },

  })
