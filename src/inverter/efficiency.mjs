import Factory from 'stampit'

export default Factory
  .methods({
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
