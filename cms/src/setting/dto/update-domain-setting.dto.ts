import { IsOptional, IsString, IsUrl, Matches } from 'class-validator';

export class UpdateDomainSettingDto {
  @IsString()
  @IsOptional()
  @Matches(/^[a-zA-Z0-9.-]+$/, { message: 'Tên miền không hợp lệ (chỉ chấp nhận chữ cái, chữ số, dấu chấm và dấu gạch ngang).' })
  domain?: string;

  @IsUrl({}, { message: 'Đường dẫn đích phải là một URL hợp lệ (ví dụ: http://... hoặc https://...)' })
  @IsOptional()
  targetUrl?: string;
}
