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
      // evtl. activePower als Möglichkeit bei Batterieversorgung checken.
      if (batteryPower > 0) {
        inverterPowerTotal -= batteryPower
        gridPowerTotal -= batteryPower
        activePower -= batteryPower
      } else {
        inverterPowerTotal += Math.abs(batteryPower)
        gridPowerTotal += Math.abs(batteryPower)
        activePower += batteryPower
      }

      return Math.min(pvPowerTotal, inverterPowerTotal, gridPowerTotal, activePower)
    },
  })
