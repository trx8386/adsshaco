import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DomainSetting, DomainSettingDocument } from './schemas/domain-setting.schema';
import { CreateDomainSettingDto } from './dto/create-domain-setting.dto';
import { UpdateDomainSettingDto } from './dto/update-domain-setting.dto';

@Injectable()
export class SettingService {
  private readonly DEFAULT_TARGET_URL = 'https://m.sc88g.vip/home/register?cid=2925260';

  constructor(
    @InjectModel(DomainSetting.name)
    private readonly domainSettingModel: Model<DomainSettingDocument>,
  ) {}

  // Chuẩn hóa tên miền đầu vào (loại bỏ protocol, www, path, port và trim/lowercase)
  sanitizeDomain(domain: string): string {
    if (!domain) return '';
    let clean = domain.trim().toLowerCase();
    // Loại bỏ protocol (http:// hoặc https://) và www.
    clean = clean.replace(/^(https?:\/\/)?(www\.)?/, '');
    // Loại bỏ path và port nếu có
    clean = clean.split('/')[0];
    clean = clean.split(':')[0];
    return clean;
  }

  async getTargetUrl(domain?: string): Promise<string> {
    if (domain) {
      const cleanDomain = this.sanitizeDomain(domain);
      if (cleanDomain) {
        const domainSetting = await this.domainSettingModel.findOne({ domain: cleanDomain }).exec();
        if (domainSetting) {
          return domainSetting.targetUrl;
        }
      }
    }
    // Fallback về link đích mặc định
    return this.DEFAULT_TARGET_URL;
  }

  // --- Domain Settings CRUD ---
  async getAllDomainSettings(): Promise<DomainSetting[]> {
    return this.domainSettingModel.find().sort({ createdAt: -1 }).exec();
  }

  async createDomainSetting(createDto: CreateDomainSettingDto): Promise<DomainSetting> {
    const cleanDomain = this.sanitizeDomain(createDto.domain);
    if (!cleanDomain) {
      throw new BadRequestException('Tên miền không hợp lệ.');
    }
    
    // Kiểm tra trùng lặp
    const existing = await this.domainSettingModel.findOne({ domain: cleanDomain }).exec();
    if (existing) {
      throw new BadRequestException('Tên miền này đã được cấu hình.');
    }

    const newSetting = new this.domainSettingModel({
      domain: cleanDomain,
      targetUrl: createDto.targetUrl,
    });
    return newSetting.save();
  }

  async updateDomainSetting(id: string, updateDto: UpdateDomainSettingDto): Promise<DomainSetting> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID cấu hình không hợp lệ.');
    }

    const updateData: any = {};
    
    if (updateDto.domain !== undefined) {
      const cleanDomain = this.sanitizeDomain(updateDto.domain);
      if (!cleanDomain) {
        throw new BadRequestException('Tên miền không hợp lệ.');
      }

      // Kiểm tra trùng lặp với bản ghi khác
      const existing = await this.domainSettingModel.findOne({ domain: cleanDomain }).exec();
      if (existing && existing._id.toString() !== id) {
        throw new BadRequestException('Tên miền này đã được cấu hình.');
      }
      updateData.domain = cleanDomain;
    }

    if (updateDto.targetUrl !== undefined) {
      updateData.targetUrl = updateDto.targetUrl;
    }

    const updated = await this.domainSettingModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    if (!updated) {
      throw new NotFoundException('Không tìm thấy cấu hình tên miền.');
    }
    return updated;
  }

  async deleteDomainSetting(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID cấu hình không hợp lệ.');
    }

    const deleted = await this.domainSettingModel.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('Không tìm thấy cấu hình tên miền.');
    }
    return { success: true };
  }
}
