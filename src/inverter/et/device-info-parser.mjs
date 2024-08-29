import Factory from 'stampit'

// import only what is needed and not the whole jungle like in plain OO
// import ReadArmFirmware from '../../bricks/read-arm-firmware.mjs'
import ReadArmSubVersion from '../../bricks/read-arm-sub-version.mjs'
import ReadArmVersion from '../../bricks/read-arm-version.mjs'
import ReadDsp1Version from '../../bricks/read-dsp1-version.mjs'
import ReadDsp2Version from '../../bricks/read-dsp2-version.mjs'
import ReadDspSubVersion from '../../bricks/read-dsp-sub-version.mjs'
// import ReadFirmware from '../../bricks/read-firmware.mjs'
import ReadModelName from '../../bricks/read-model-name.mjs'
import ReadNumberOfPhases from '../../bricks/read-number-of-phases.mjs'
import ReadRatedPower from '../../bricks/read-rated-power.mjs'
import ReadSerialNumber from '../../bricks/read-serial-number.mjs'

export default Factory
  .compose( // compose it
    // ReadArmFirmware,
    ReadArmSubVersion,
    ReadArmVersion,
    ReadDsp1Version,
    ReadDsp2Version,
    ReadDspSubVersion,
    // ReadFirmware,
    ReadModelName,
    ReadRatedPower,
    ReadSerialNumber,
    ReadNumberOfPhases,
  )

  .init((param, {instance}) => {
    return { // use it
      ratedPower    : instance._readRatedPower(35001),
      serialNumber  : instance._readSerialNumber(35003),
      modelName     : instance._readModelName(35011),
      dsp1Version   : instance._readDsp2Version(35016),
      dsp2Version   : instance._readDsp2Version(35017),
      dspSubVersion : instance._readDspSubVersion(35018),
      armVersion    : instance._readArmVersion(35019),
      armSubVersion : instance._readArmSubVersion(35020),
      numberOfPhases: instance._readNumberOfPhases(35003), // same register since it is determined via the serialNumber

      // firmware     : instance._readFirmware(35021),
      // armFirmware  : instance._readArmFirmware(35027),
    }
  })
