import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingService } from './setting.service';
import { SettingController } from './setting.controller';
import { DomainSetting, DomainSettingSchema } from './schemas/domain-setting.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DomainSetting.name, schema: DomainSettingSchema },
    ]),
    AuthModule,
  ],
  controllers: [SettingController],
  providers: [SettingService],
  exports: [SettingService],
})
export class SettingModule {}
