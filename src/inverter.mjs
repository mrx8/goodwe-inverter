import Protocol from './protocol.mjs'

export default Protocol
  .methods({
    getDeviceInfo () {
      return this.requestResponse(Buffer.from('7F03753100280409', 'hex'))
    },
  })


//      self._READ_DEVICE_VERSION_INFO: ProtocolCommand = self._read_command(0x7531, 0x0028)
