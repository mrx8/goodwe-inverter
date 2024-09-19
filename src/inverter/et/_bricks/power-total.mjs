import Factory from 'stampit'

export default Factory
  .methods({
    calculatePowerTotal ({
      pvPowerTotal,
      batteryPower,
      inverterPowerTotal,
      gridPowerTotal,
    }) {
      // evtl. activePower als Möglichkeit bei Batterieversorgung checken.
      if (batteryPower > 0) {
        inverterPowerTotal -= batteryPower
        gridPowerTotal -= batteryPower
      } else {
        inverterPowerTotal += Math.abs(batteryPower)
        gridPowerTotal += Math.abs(batteryPower)
      }

      return Math.min(pvPowerTotal, inverterPowerTotal, gridPowerTotal)
    },
  })
