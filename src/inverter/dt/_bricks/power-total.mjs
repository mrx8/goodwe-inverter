import Factory from 'stampit'

export default Factory
  .methods({
    calculatePowerTotal ({
      powerTotal,
      gridPowerTotal,
      pvPowerTotal,
    }) {
      if (pvPowerTotal > 0) {
        if (powerTotal < pvPowerTotal) {
          return powerTotal
        }

        if (gridPowerTotal > 0 && gridPowerTotal < pvPowerTotal) {
          return gridPowerTotal
        }
      }

      return pvPowerTotal
    },
  })
