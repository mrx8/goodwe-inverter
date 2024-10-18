import Factory from 'stampit'

export default Factory
  .methods({
    calculatePowerTotal ({
      powerTotal,
      gridPowerTotal,
      pvPowerTotal,
      workModeCode,

    }) {
      if (workModeCode === 1) {
        return Math.min(pvPowerTotal, powerTotal, gridPowerTotal)
      }

      return 0
    },
  })
