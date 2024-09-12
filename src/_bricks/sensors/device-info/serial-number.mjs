import Factory from 'stampit'
import ReadString from '../read-string.mjs'
import Registers from '../registers.mjs'


export default Factory
  .compose(
    Registers,
    ReadString,
  )

  .statics({
    readSerialNumber (register) {
      const promiseForMessage = this.getStamp().registers.add(register)

      return this
      .init((param, {instance}) => {

      })

      await this.registers.getPromiseForRegister(register)

      return this.readString(register, 16)
    },
  })


// registrieren von registerNummern in der Factory (da das nur einmal zu erstellen ist)

// 
// in der init:
// dynamisch die register start + länge erstellen (nur 1x pro Factory machen)
// alle parallel oder seriell holen, je nachdem was geht.
// promise resolven welche die parse-routinen
