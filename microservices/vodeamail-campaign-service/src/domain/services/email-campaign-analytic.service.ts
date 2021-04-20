import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailCampaignAudience } from '../entities/email-campaign-audience.entity';
import { EmailCampaignAnalytic } from '../entities/email-campaign-analytic.entity';

@Injectable()
export class EmailCampaignAnalyticService {
  constructor(
    @InjectRepository(EmailCampaignAnalytic)
    private readonly emailCampaignAnalyticRepository: Repository<EmailCampaignAnalytic>,
    @InjectRepository(EmailCampaignAudience)
    private readonly emailCampaignAudienceRepository: Repository<EmailCampaignAudience>,
  ) {}

  async clicked() {}

  async opened() {}

  async unSubscribed() {}
}
