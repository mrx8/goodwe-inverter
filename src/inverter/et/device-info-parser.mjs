import Factory from 'stampit'
import ReadArmFirmware from '../../parser/bricks/read-arm-firmware.mjs'
import ReadArmSubVersion from '../../parser/bricks/read-arm-sub-version.mjs'
import ReadArmVersion from '../../parser/bricks/read-arm-version.mjs'
import ReadDsp1Version from '../../parser/bricks/read-dsp1-version.mjs'
import ReadDsp2Version from '../../parser/bricks/read-dsp2-version.mjs'
import ReadDspSubVersion from '../../parser/bricks/read-dsp-sub-version.mjs'
import ReadFirmware from '../../parser/bricks/read-firmware.mjs'
import ReadModelName from '../../parser/bricks/read-model-name.mjs'
import ReadRatedPower from '../../parser/bricks/read-rated-power.mjs'
import ReadSerialNumber from '../../parser/bricks/read-serial-number.mjs'

export default Factory
  .compose(
    ReadArmFirmware,
    ReadArmSubVersion,
    ReadArmVersion,
    ReadDsp1Version,
    ReadDsp2Version,
    ReadDspSubVersion,
    ReadFirmware,
    ReadModelName,
    ReadRatedPower,
    ReadSerialNumber,
  )

  .methods({
    parse () {
      return {
        ratedPower   : this._readRatedPower(35001),
        serialNumber : this._readSerialNumber(35003),
        modelName    : this._readModelName(35011),
        dsp1Version  : this._readDsp2Version(35016),
        dsp2Version  : this._readDsp2Version(35017),
        dspSubVersion: this._readDspSubVersion(35018),
        armVersion   : this._readArmVersion(35019),
        armSubVersion: this._readArmSubVersion(35020),
        firmware     : this._readFirmware(35021),
        armFirmware  : this._readArmFirmware(35027),
      }
    },
  })
// self.firmware = self._decode(response[42:54])  # 35021 - 35027
// self.arm_firmware = self._decode(response[54:66])  # 35027 - 35032
