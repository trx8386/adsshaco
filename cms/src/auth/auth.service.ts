import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async login(username: string, password: string) {
    const adminUsername = this.configService.get<string>('ADMIN_USERNAME');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

    if (username !== adminUsername || password !== adminPassword) {
      throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không chính xác.');
    }

    const payload = { username };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
