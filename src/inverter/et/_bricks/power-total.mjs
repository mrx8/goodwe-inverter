import Factory from 'stampit'

export default Factory
  .init(({
    gridPowerTotal,
    batteryPower,
    pvPowerTotal,
  }) => {
    if (pvPowerTotal > 0) { // depends on solar-activity
      gridPowerTotal = Math.abs(gridPowerTotal)
      if (batteryPower > 0) { // if the battery is discharging the power is obviously not sufficient for our home but is included in gridPowerTotal.
        return gridPowerTotal - batteryPower // therefore substract it from gridPowerTotal.
      }

      // if battery is charging, power is not included in gridPowerTotal but it can potentially be used if needed from outside.
      return gridPowerTotal + Math.abs(batteryPower) // therefore add it to gridPowerTotal.
    }

    // if there is no solar activity
    return 0 // or we would count batteryPower for example during the night.
  })
