import { Injectable } from '@nestjs/common'

@Injectable()
export class AuthService {
  private codes = new Map<string, string>()

  sendCode(phone: string) {
    const code = Math.floor(
      100000 + Math.random() * 900000
    ).toString()

    this.codes.set(phone, code)

    console.log(`Phone: ${phone}`)
    console.log(`SMS code: ${code}`)

    return {
      success: true,
    }
  }

  verifyCode(phone: string, code: string) {
    const savedCode = this.codes.get(phone)

    if (!savedCode) {
      return {
        success: false,
        message: 'Код не найден или истёк',
      }
    }

    if (savedCode !== code) {
      return {
        success: false,
        message: 'Неверный код',
      }
    }

    this.codes.delete(phone)

    return {
      success: true,
    }
  }
}