import Factory from 'stampit'

export default Factory
  .methods({
    calculatePowerTotal ({
      powerTotal,
      gridPowerTotal,
      pvPowerTotal,
    }) {
      return Math.min(pvPowerTotal, powerTotal, gridPowerTotal)
    },
  })
