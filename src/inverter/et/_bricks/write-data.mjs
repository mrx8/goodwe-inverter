import Factory from 'stampit'
import InverterWrite from '../../inverter-write.mjs'
import {ProgrammerError} from '../../../shared/error.mjs'

export default Factory
  .compose(
    InverterWrite,
  )

  .configuration({
    writeableStates: [
      'settingsData.EMSPowerMode',
      'settingsData.EMSPowerSet',
      'settingsData.batteryMinimumStateOfChargeOnGrid',
      'settingsData.batteryFastChargeEnable',
      'settingsData.batteryFastChargeStopStateOfCharge',
      'settingsData.batteryFastChargePower',
    ],
  })

  .methods({
    async writeEMSPowerMode (registerValue) {
      // 47511 EMSPowerMode [1-12, 255]; default: 1
      // Table 8-16 EMS Power Mode
      // Application scenarios MODE
      // COMMAND PV Grid Battery
      // EMSPowerMode EMSPowerSet Power priority (Green is the control object)

      // System shutdown
      // Stopped 0x00FF NA
      // Note :Stop working and switch to wait mode
      // Self-use

      // Auto 0x0001 NA
      // Note: PBattery =PInv - Pmeter – Ppv (Discharge/Charge)
      // The battery power is controlled by the meter power when the meter communication is normal. Control the battery to keep
      // charging

      // Charge-PV 0x0002 Xmax【2】 High Low
      // 【1】 Energy InNote :PBattery =Xmax + PV (Charge)
      // Xmax is to allow the power to be taken from the grid, and PV power is preferred. When set to 0, only PV power is used. Chargingpower will be limited by charging current limit. Control the battery to keep
      // discharging

      // Dischg+PV 0x0003 Xmax High Energy Out LowNote : PBattery = Xmax（Discharge）
      // Xmax is the allowable discharge power of the battery. When the power fed into the grid is limited, PV power will be usedfirst.

      // The inverter is used as a unit for power grid energy scheduling
      // Import-AC 0x0004 Xset【3】 Low High Energy InNote :PBattery = Xset + PV (Charge)
      // Xset refers to the power purchased from the power grid. The power purchased from the grid is preferred. If the PVpower is too large, the MPPT power will be limited.(grid side load is not considered)

      // Export-AC 0x0005 Xset High Energy Out LowNote : PBattery = Xset (Discharge)
      // Xset is to sell power to the grid. PV power is preferred. When PV energy is insufficient, the battery will discharge.PVpower will belimited by x.(grid side load is not considered)
      // Off-grid reservation mode

      // Conserve 0x0006 NA
      // Note : PBattery = PV (Charge)
      // In on-grid mode, the battery is continuously charged, and only PV power (AC Couple model takes 10%of the rated power of the power grid) is used. The battery can only discharge in off-grid mode. PV do not support the loads first. Off-Grid Mode

      // Off-Grid 0x0007 NA
      // Note : PBattery =Pbackup – Ppv (Charge/Discharge)
      // Forced off-grid operation (Disconnect from grid)
      // No battery mode for hybrid
      // inverter

      // Battery standby 0x0008 NA
      // Note : PBattery =0 (Standby)
      // The battery does not charge and discharge
      // Regional energy
      // management

      // Buy Power 0x0009 Xset Low High Energy In/Out
      // Note :PBattery = PInv – (Pmeter + Xset)– Ppv (Charge/Discharge)
      // When the meter communication is normal, the power purchased from the power grid is controlled as Xset. When the PVpower is too large, the MPPT power will be limited. When the load is too large, the battery will discharge.

      // Sell Power 0x000A Xset High Energy Out LowNote : PBattery = PInv – (Pmeter – Xset) – Ppv (Charge/Discharge)
      // When the communication of electricity meter is normal, the power sold from the power grid is controlled as Xset, PVpower is preferred, and the battery discharges when PV energy is insufficient.PV power will be limited by Xset.
      // Force the battery to work
      // at set power value

      // Charge-BAT 0x000B Xset High Low Energy InNote : PBattery = Xset (Charge)
      // Xset is the charging power of the battery. PV power is preferred. When PV power is insufficient, it will buy power from the power grid. The charging power is also affected by the charging current limit.

      // Discharge-BAT 0x000C Xset Low Energy In High
      // Note : PBattery = Xset (Discharge)
      // Xset is the discharge power of the battery, and the battery discharge has priority. If the PV power is too large, MPPT will belimited. Discharge power is also affected by discharge current

      const value = Number.parseInt(registerValue, 10)
      if (Number.isNaN(value) || value < 0 || value > 255) {
        throw new ProgrammerError('value is not an integer or not between [0,255]', 'PARAM_ERROR')
      }

      await this.writeRegister(47511, value)
    },

    async writeEMSPowerSet (registerValue) {
      // 47512 EMSPowerSet [0,10000]; default: 10000
      const value = Number.parseInt(registerValue, 10)
      if (Number.isNaN(value) || value < 0 || value > 10000) {
        throw new ProgrammerError('value is not an integer or not between [0,10000]', 'PARAM_ERROR')
      }

      await this.writeRegister(47512, value)
    },

    async writeBatteryMinimumStateOfChargeOnGrid (registerValue) {
      // 45356 BattSOCUnderMin RW U16 1 1 [0,100]
      const value = Number.parseInt(registerValue, 10)
      if (Number.isNaN(value) || value < 0 || value > 100) {
        throw new ProgrammerError('value is not an integer or not between [0,100]', 'PARAM_ERROR')
      }

      await this.writeRegister(45356, value)
    },

    async writeBatteryFastChargeEnable (registerValue) {
      // 47545 FastChargeEnable RW U16 1 1 [0,1] 0: Disable 1:Enable
      const value = Number.parseInt(registerValue, 10)
      if (Number.isNaN(value) || value < 0 || value > 1) {
        throw new ProgrammerError('value is not an integer or not between [0,1]', 'PARAM_ERROR')
      }

      await this.writeRegister(47545, value)
    },

    async writeBatteryFastChargeStopStateOfCharge (registerValue) {
      // 47546 FastChargeStopSoc RW U16 1 1 [0,100] => SoC zum stoppen des Ladevorgangs: immer mindestens current SoC + 2 sonst ILLEGAL_DATA_VALUE.
      const value = Number.parseInt(registerValue, 10)
      if (Number.isNaN(value) || value < 0 || value > 100) {
        throw new ProgrammerError('value is not an integer or not between [0,100]', 'PARAM_ERROR')
      }

      await this.writeRegister(47546, value)
    },

    async writeBatteryFastChargePower (registerValue) {
      // 47603 FastChargePower RW U16 1 1 [0,100]
      const value = Number.parseInt(registerValue, 10)
      if (Number.isNaN(value) || value < 0 || value > 100) {
        throw new ProgrammerError('value is not an integer or not between [0,100]', 'PARAM_ERROR')
      }

      await this.writeRegister(47603, value)
    },
  })
