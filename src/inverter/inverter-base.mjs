import {diff as DiffObject} from 'deep-object-diff'
import Factory from 'stampit'
import Param from '../shared/param.mjs'


export default Factory
  .compose(
    Param,
  )

  .methods({
    async updateChanges () {
      const data = await this.ReadDataFactory()
      const diff = DiffObject(this.data, data)
      this.data = data

      return diff
    },
  })
