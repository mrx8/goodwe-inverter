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

  .methods({
    async updateChanges () {
      const data = await this.ReadDataFactory()
      const diff = DiffObject(this.data, data)
      this.data = data

      return diff
    },
  })
