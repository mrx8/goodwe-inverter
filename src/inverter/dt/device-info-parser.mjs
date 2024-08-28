import Factory from 'stampit'

// import only what is needed and not the whole jungle like in plain OO
import ReadArmSubVersion from '../../bricks/read-arm-sub-version.mjs'
import ReadArmVersion from '../../bricks/read-arm-version.mjs'
import ReadDsp1Version from '../../bricks/read-dsp1-version.mjs'
import ReadDsp2Version from '../../bricks/read-dsp2-version.mjs'
import ReadDspSubVersion from '../../bricks/read-dsp-sub-version.mjs'
import ReadModelName from '../../bricks/read-model-name.mjs'
import ReadSerialNumber from '../../bricks/read-serial-number.mjs'

export default Factory
  .compose( // compose it
    ReadArmSubVersion,
    ReadArmVersion,
    ReadDsp1Version,
    ReadDsp2Version,
    ReadDspSubVersion,
    ReadModelName,
    ReadSerialNumber,
  )

  .methods({
    parse () {
      return { // use it
        serialNumber : this._readSerialNumber(30004),
        modelName    : this._readModelName(30012),
        dsp1Version  : this._readDsp2Version(30034),
        dsp2Version  : this._readDsp2Version(30035),
        dspSubVersion: this._readDspSubVersion(30037),
        armVersion   : this._readArmVersion(30036),
        armSubVersion: this._readArmSubVersion(30038),
      }
    },
  })
