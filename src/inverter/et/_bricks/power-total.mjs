import Factory from 'stampit'

export default Factory
  .methods({
    calculatePowerTotal ({
      gridPowerTotal,
      batteryPower,
      pvPowerTotal,
    }) {
      if (pvPowerTotal > 0) { // depends on solar-activity
        if (batteryPower > 0) { // if the battery is discharging the power is obviously not sufficient for our home but is included in gridPowerTotal.
          const powerTotal = gridPowerTotal - batteryPower // therefore substract it from gridPowerTotal.
          if (powerTotal < pvPowerTotal) {
            return powerTotal
          }
        } else {
          // if battery is charging, power is not included in gridPowerTotal but it can potentially be used if needed from outside.
          const powerTotal = gridPowerTotal + Math.abs(batteryPower) // therefore add it to gridPowerTotal.
          if (powerTotal < pvPowerTotal) {
            return powerTotal
          }
        }
      }

      return pvPowerTotal
    },
  })
