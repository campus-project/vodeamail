import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EmailCampaignService } from '../../domain/services/email-campaign.service';
import {
  CreateEmailCampaignDto,
  DeleteEmailCampaignDto,
  FindAllEmailCampaignDto,
  FindOneEmailCampaignDto,
  UpdateEmailCampaignDto,
} from '../dtos/email-campaign.dto';

@Controller()
export class EmailCampaignController {
  constructor(
    @Inject('CAMPAIGN_EMAIL_CAMPAIGN_SERVICE')
    private readonly emailCampaign: EmailCampaignService,
  ) {}

  @MessagePattern('MS_CAMPAIGN_CREATE_EMAIL_CAMPAIGN')
  create(@Payload() createEmailCampaignDto: CreateEmailCampaignDto) {
    return this.emailCampaign.create(createEmailCampaignDto);
  }

  @MessagePattern('MS_CAMPAIGN_FIND_ALL_EMAIL_CAMPAIGN')
  findAll(@Payload() findAllEmailCampaignDto: FindAllEmailCampaignDto) {
    return this.emailCampaign.findAll(findAllEmailCampaignDto);
  }

  @MessagePattern('MS_CAMPAIGN_FIND_ALL_COUNT_EMAIL_CAMPAIGN')
  findAllCount(@Payload() findAllEmailCampaignDto: FindAllEmailCampaignDto) {
    return this.emailCampaign.findAllCount(findAllEmailCampaignDto);
  }

  @MessagePattern('MS_CAMPAIGN_FIND_ALL_BUILDER_EMAIL_CAMPAIGN')
  findAllBuilder(@Payload() findAllEmailCampaignDto: FindAllEmailCampaignDto) {
    return this.emailCampaign.findAllBuilder(findAllEmailCampaignDto);
  }

  @MessagePattern('MS_CAMPAIGN_FIND_ONE_EMAIL_CAMPAIGN')
  findOne(@Payload() findOneEmailCampaignDto: FindOneEmailCampaignDto) {
    return this.emailCampaign.findOne(findOneEmailCampaignDto);
  }

  @MessagePattern('MS_CAMPAIGN_UPDATE_EMAIL_CAMPAIGN')
  update(@Payload() updateEmailCampaignDto: UpdateEmailCampaignDto) {
    return this.emailCampaign.update(updateEmailCampaignDto);
  }

  @MessagePattern('MS_CAMPAIGN_REMOVE_EMAIL_CAMPAIGN')
  remove(@Payload() deleteEmailCampaignDto: DeleteEmailCampaignDto) {
    return this.emailCampaign.remove(deleteEmailCampaignDto);
  }
}
