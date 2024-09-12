import Factory from 'stampit'

// import only what is needed and not the whole jungle like in plain OO
import ReadArmSubVersion from '../../../_bricks/sensors/device-info/read-arm-sub-version.mjs'
import ReadArmVersion from '../../../_bricks/sensors/device-info/read-arm-version.mjs'
import ReadDsp1Version from '../../../_bricks/sensors/device-info/read-dsp1-version.mjs'
import ReadDsp2Version from '../../../_bricks/sensors/device-info/read-dsp2-version.mjs'
import ReadDspSubVersion from '../../../_bricks/sensors/device-info/read-dsp-sub-version.mjs'
import ReadModelName from '../../../_bricks/sensors/device-info/read-model-name.mjs'
import ReadNumberOfPhases from '../../../_bricks/sensors/device-info/read-number-of-phases.mjs'
import ReadSerialNumber from '../../../_bricks/sensors/device-info/read-serial-number.mjs'


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
    instance.deviceInfo = instance.deviceInfo || {}

    const data = { // use it
      armSubVersion : instance.readArmSubVersion(30038),
      armVersion    : instance.readArmVersion(30036),
      dsp1Version   : instance.readDsp1Version(30034),
      dsp2Version   : instance.readDsp2Version(30035),
      dspSubVersion : instance.readDspSubVersion(30037),
      modelName     : instance.readModelName(30012),
      numberOfPhases: instance.readNumberOfPhases(30004), // same register since it is determined via the serialNumber
      serialNumber  : instance.readSerialNumber(30004),
    }

    Object.assign(instance.deviceInfo, data)

    return instance
  })

  .methods({
    getData () {
      return {
        deviceInfo: this.deviceInfo,
      }
    },
  })
