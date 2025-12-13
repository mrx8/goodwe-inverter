import {diff as DiffObject} from 'deep-object-diff'
import Factory from 'stampit'
import InverterWrite from './inverter-write.mjs'
import Log from '../shared/log.mjs'
import Param from '../shared/param.mjs'
import {setTimeout as sleep} from 'node:timers/promises'


export default Factory
  .compose(
    Param,
    Log,
    InverterWrite,
  )

  .setLogId('inverter')

  .properties({
    updateInterval: 9 * 1000,
  })

  .init((param, {instance}) => {
    instance.detectOnly = param.detectOnly || false
    instance.data = {}
  })

  .methods({
    async updateChanges () {
      await sleep(this.updateInterval)
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
