import Factory from 'stampit'

export default Factory
  .methods({
    calculatePowerTotal ({
      powerTotal,
      pvPowerTotal,
      workModeCode,
    }) {
      if (workModeCode === 1) {
        return Math.min(pvPowerTotal, powerTotal)
      }

      return 0
    },
  })
