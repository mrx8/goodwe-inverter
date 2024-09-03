import Factory from 'stampit'

// import only what is needed and not the whole jungle like in plain OO
import ReadArmSubVersion from '../../_bricks/read-arm-sub-version.mjs'
import ReadArmVersion from '../../_bricks/read-arm-version.mjs'
import ReadDsp1Version from '../../_bricks/read-dsp1-version.mjs'
import ReadDsp2Version from '../../_bricks/read-dsp2-version.mjs'
import ReadDspSubVersion from '../../_bricks/read-dsp-sub-version.mjs'
import ReadModelName from '../../_bricks/read-model-name.mjs'
import ReadNumberOfPhases from '../../_bricks/read-number-of-phases.mjs'
import ReadSerialNumber from '../../_bricks/read-serial-number.mjs'


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
      armSubVersion : instance.readArmSubVersion(30038),
      armVersion    : instance.readArmVersion(30036),
      dsp1Version   : instance.readDsp2Version(30034),
      dsp2Version   : instance.readDsp2Version(30035),
      dspSubVersion : instance.readDspSubVersion(30037),
      modelName     : instance.readModelName(30012),
      numberOfPhases: instance.readNumberOfPhases(30004), // same register since it is determined via the serialNumber
      serialNumber  : instance.readSerialNumber(30004),
    }
  })
