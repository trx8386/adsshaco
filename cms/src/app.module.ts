import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { SettingModule } from './setting/setting.module';

@Module({
  imports: [
    // Biến môi trường
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Kết nối MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),
    // Phục vụ giao diện Admin tĩnh từ thư mục public
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api', '/api/{*path}'], // Không áp dụng cho các route API
    }),
    // Modules nghiệp vụ
    AuthModule,
    SettingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
