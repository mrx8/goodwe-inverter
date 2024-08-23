import {MODBUS_ADDRESS, MODBUS_READ_CMD, createRtuRequestMessage} from './modbus.mjs'
import Protocol from './protocol.mjs'


export default Protocol
  .methods({
    getDeviceInfo () {
      const message = createRtuRequestMessage({
        address: MODBUS_ADDRESS,
        command: MODBUS_READ_CMD,
        offset : 0x7531,
        value  : 0x28,
      })
      console.log(message.toString('hex'))

      return this.requestResponse(message)
    },
  })

//  return this.requestResponse(Buffer.from('7F03753100280409', 'hex'))

/*
MODBUS_READ_CMD: int = 0x3
MODBUS_WRITE_CMD: int = 0x6
MODBUS_WRITE_MULTI_CMD: int = 0x10
*/
/* send

let sendbuf = new Uint8Array(9);
  let i;
  let crc = 0;

  sendbuf[0] = GoodWePacket.Header.High;
  sendbuf[1] = GoodWePacket.Header.Low;
  sendbuf[2] = GoodWePacket.Addr.AP;
  sendbuf[3] = GoodWePacket.Addr.Inverter;
  sendbuf[4] = GoodWePacket.CtrCode.Read;
  sendbuf[5] = GoodWePacket.FcCodeRead.QueryIdInfo;
  sendbuf[6] = 0;

  for (i = 0; i <= 6; i++) {
    crc = crc + sendbuf[i];
  }

  sendbuf[7] = crc >> 8;
  sendbuf[8] = crc & 0x00ff;
*/


/* receive and parse
        self._READ_DEVICE_VERSION_INFO: ProtocolCommand = self._read_command(0x7531, 0x0028)


        response = await self._read_from_socket(self._READ_DEVICE_VERSION_INFO)
        response = response.response_data()
        try:
            self.model_name = response[22:32].decode("ascii").rstrip()
        except:
            print("No model name sent from the inverter.")
        # Modbus registers from 30001 - 30040
        self.serial_number = self._decode(response[6:22])  # 30004 - 30012
        self.dsp1_version = read_unsigned_int(response, 66)  # 30034
        self.dsp2_version = read_unsigned_int(response, 68)  # 30035
        self.arm_version = read_unsigned_int(response, 70)  # 30036
        self.dsp_svn_version = read_unsigned_int(response, 72)  # 35037
        self.arm_svn_version = read_unsigned_int(response, 74)  # 35038
        self.firmware = f"{self.dsp1_version}.{self.dsp2_version}.{self.arm_version:02x}"

        if is_single_phase(self):
            # this is single phase inverter, filter out all L2 and L3 sensors
            self._sensors = tuple(filter(self._single_phase_only, self.__all_sensors))
            self._settings.update({s.id_: s for s in self.__settings_single_phase})
        else:
            self._settings.update({s.id_: s for s in self.__settings_three_phase})

        if is_3_mppt(self):
            # this is 3 PV strings inverter, keep all sensors
            pass
        else:
            # this is only 2 PV strings inverter
            self._sensors = tuple(filter(self._pv1_pv2_only, self._sensors))

            */


/* device info message parse
    this.#client.once("message", (rcvbuf) => {
      if (this.#CheckRecPacket(rcvbuf, sendbuf[4], sendbuf[5])) {
        this.#idInfo.FirmwareVersion = this.#GetStringFromByteArray(rcvbuf, 7, 5);
        this.#idInfo.ModelName = this.#GetStringFromByteArray(rcvbuf, 12, 10);
        this.#idInfo.Na = rcvbuf.slice(22, 37);
        this.#idInfo.SerialNumber = this.#GetStringFromByteArray(rcvbuf, 38, 16);
        this.#idInfo.NomVpv = this.#GetUintFromByteArray(rcvbuf, 54, 4) / 10;
        this.#idInfo.InternalVersion = this.#GetStringFromByteArray(rcvbuf, 58, 12);
        this.#idInfo.SafetyCountryCode = rcvbuf[70];

        this.#status = GoodWeUdp.ConStatus.Online;
      } else {
        this.#status = GoodWeUdp.ConStatus.Offline;
      }
    });


    #CheckRecPacket(Data, CtrCode, FctCode) {
  let packetFormat = new Uint8Array(GoodWePacket.Format.Packet);
  let packetCrc = new Uint8Array(GoodWePacket.Format.Checksum);
  let i;
  let crc = 0;
  let low, high;

  packetFormat = Data.slice(0, GoodWePacket.Format.Packet);
  packetCrc = Data.slice(Data.length - GoodWePacket.Format.Checksum, Data.length);

  for (i = 0; i < Data.length - GoodWePacket.Format.Checksum; i++) {
    crc = crc + Data[i];
  }

  high = crc >> 8;
  low = crc & 0x00ff;

  if (packetCrc[0] == high && packetCrc[1] == low) {
    if (packetFormat[0] == GoodWePacket.Header.High && packetFormat[1] == GoodWePacket.Header.Low) {
      if (packetFormat[2] == GoodWePacket.Addr.Inverter && packetFormat[3] == GoodWePacket.Addr.AP) {
        if (packetFormat[4] == CtrCode) {
          if (packetFormat[5] == (FctCode | 0x80)) {
            return true;
          }
        }
      }
    }
  }
  return false;
      */
