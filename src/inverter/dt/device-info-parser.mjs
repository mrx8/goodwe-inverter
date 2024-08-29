import Factory from 'stampit'

// import only what is needed and not the whole jungle like in plain OO
import ReadArmSubVersion from '../../bricks/read-arm-sub-version.mjs'
import ReadArmVersion from '../../bricks/read-arm-version.mjs'
import ReadDsp1Version from '../../bricks/read-dsp1-version.mjs'
import ReadDsp2Version from '../../bricks/read-dsp2-version.mjs'
import ReadDspSubVersion from '../../bricks/read-dsp-sub-version.mjs'
import ReadModelName from '../../bricks/read-model-name.mjs'
import ReadNumberOfPhases from '../../bricks/read-number-of-phases.mjs'
import ReadSerialNumber from '../../bricks/read-serial-number.mjs'


export default Factory
  .compose( // compose it
    ReadArmSubVersion,
    ReadArmVersion,
    ReadDsp1Version,
    ReadDsp2Version,
    ReadDspSubVersion,
    ReadModelName,
    ReadNumberOfPhases,
    ReadSerialNumber,
  )

  .init((param, {instance}) => {
    return { // use it
      armSubVersion : instance._readArmSubVersion(30038),
      armVersion    : instance._readArmVersion(30036),
      dsp1Version   : instance._readDsp2Version(30034),
      dsp2Version   : instance._readDsp2Version(30035),
      dspSubVersion : instance._readDspSubVersion(30037),
      modelName     : instance._readModelName(30012),
      numberOfPhases: instance._readNumberOfPhases(30004), // same register since it is determined via the serialNumber
      serialNumber  : instance._readSerialNumber(30004),
    }
  })
