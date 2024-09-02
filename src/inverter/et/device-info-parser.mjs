import Factory from 'stampit'

// import only what is needed and not the whole jungle like in plain OO
import ReadArmSubVersion from '../../bricks/read-arm-sub-version.mjs'
import ReadArmVersion from '../../bricks/read-arm-version.mjs'
import ReadDsp1Version from '../../bricks/read-dsp1-version.mjs'
import ReadDsp2Version from '../../bricks/read-dsp2-version.mjs'
import ReadDspSubVersion from '../../bricks/read-dsp-sub-version.mjs'
import ReadIs745platform from '../../bricks/read-is-745platform.mjs'
import ReadModelName from '../../bricks/read-model-name.mjs'
import ReadNumberOfPhases from '../../bricks/read-number-of-phases.mjs'
import ReadRatedPower from '../../bricks/read-rated-power.mjs'
import ReadSerialNumber from '../../bricks/read-serial-number.mjs'

export default Factory
  .compose( // compose it
    ReadArmSubVersion,
    ReadArmVersion,
    ReadDsp1Version,
    ReadDsp2Version,
    ReadDspSubVersion,
    ReadIs745platform,
    ReadModelName,
    ReadRatedPower,
    ReadSerialNumber,
    ReadNumberOfPhases,
  )

  .init((param, {instance}) => {
    instance.deviceInfo = instance.deviceInfo || {}

    const data = { // use it
      ratedPower    : instance.readRatedPower(35001),
      serialNumber  : instance.readSerialNumber(35003),
      modelName     : instance.readModelName(35011),
      dsp1Version   : instance.readDsp2Version(35016),
      dsp2Version   : instance.readDsp2Version(35017),
      dspSubVersion : instance.readDspSubVersion(35018),
      armVersion    : instance.readArmVersion(35019),
      armSubVersion : instance.readArmSubVersion(35020),
      numberOfPhases: instance.readNumberOfPhases(35003), // same register since it is determined via the serialNumber
      is745Platform : instance.readIs745Platform(35003), // same register since it is determined via the serialNumber
    }

    Object.assign(instance.deviceInfo, data)

    return instance
  })
