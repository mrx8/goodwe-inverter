import Factory from 'stampit'

export default Factory
  .methods({
    calculatePowerTotal ({
      pvPowerTotal,
      batteryPower,
      inverterPowerTotal,
      gridPowerTotal,
      workModeCode,
    }) {
      if (workModeCode === 1 || workModeCode === 2) {
        if (batteryPower > 0) {
          inverterPowerTotal -= batteryPower
          gridPowerTotal -= batteryPower
        } else {
          inverterPowerTotal += Math.abs(batteryPower)
          gridPowerTotal += Math.abs(batteryPower)
        }

        let powerTotal = Math.min(pvPowerTotal, inverterPowerTotal, gridPowerTotal)
        if (pvPowerTotal === 0 && powerTotal < 0) {
          powerTotal = 0
        }

        return powerTotal
      }

      return 0
    },
  })
