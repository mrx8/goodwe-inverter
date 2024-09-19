import Factory from 'stampit'

export default Factory
  .methods({
    calculatePowerTotal ({
      powerTotal,
      gridPowerTotal,
      pvPowerTotal,
    }) {
      if (gridPowerTotal === 0) {
        gridPowerTotal = Infinity
      }

      if (powerTotal === 0) {
        powerTotal = Infinity
      }

      return Math.min(pvPowerTotal, powerTotal, gridPowerTotal)
    },
  })
