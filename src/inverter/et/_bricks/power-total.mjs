import Factory from 'stampit'

export default Factory
  .methods({
    calculatePowerTotal ({
      gridPowerTotal,
      batteryPower,
      pvPowerTotal,
    }) {
      if (batteryPower > 0) {
        gridPowerTotal -= batteryPower
      } else {
        gridPowerTotal += Math.abs(batteryPower)
      }

      return Math.min(pvPowerTotal, gridPowerTotal)
    },
  })
