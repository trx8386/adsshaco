import { Controller, Get, Post, Patch, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { SettingService } from './setting.service';
import { CreateDomainSettingDto } from './dto/create-domain-setting.dto';
import { UpdateDomainSettingDto } from './dto/update-domain-setting.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('settings')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  // API công khai để Landing Page/Theme lấy link đích
  @Get('target')
  async getTarget(@Query('domain') domain?: string) {
    const targetUrl = await this.settingService.getTargetUrl(domain);
    return { targetUrl };
  }

  // API bảo mật lấy toàn bộ cấu hình tên miền
  @UseGuards(JwtAuthGuard)
  @Get('domains')
  async getDomains() {
    return this.settingService.getAllDomainSettings();
  }

  // API bảo mật thêm cấu hình tên miền mới
  @UseGuards(JwtAuthGuard)
  @Post('domains')
  async createDomain(@Body() createDto: CreateDomainSettingDto) {
    return this.settingService.createDomainSetting(createDto);
  }

  // API bảo mật cập nhật cấu hình tên miền
  @UseGuards(JwtAuthGuard)
  @Patch('domains/:id')
  async updateDomain(@Param('id') id: string, @Body() updateDto: UpdateDomainSettingDto) {
    return this.settingService.updateDomainSetting(id, updateDto);
  }

  // API bảo mật xóa cấu hình tên miền
  @UseGuards(JwtAuthGuard)
  @Delete('domains/:id')
  async deleteDomain(@Param('id') id: string) {
    return this.settingService.deleteDomainSetting(id);
  }
}
