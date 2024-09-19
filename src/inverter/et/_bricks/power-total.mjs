import Factory from 'stampit'

export default Factory
  .methods({
    calculatePowerTotal ({
      activePower,
      pvPowerTotal,
      batteryPower,
      inverterPowerTotal,
      gridPowerTotal,
    }) {
      if (batteryPower > 0) {
        inverterPowerTotal -= batteryPower
        gridPowerTotal -= batteryPower
        activePower -= batteryPower // check this if correct
      } else {
        inverterPowerTotal += Math.abs(batteryPower)
        gridPowerTotal += Math.abs(batteryPower)
        activePower += batteryPower
      }

      return Math.min(pvPowerTotal, inverterPowerTotal, gridPowerTotal, activePower)
    },
  })
