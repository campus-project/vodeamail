import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EmailCampaignService } from '../../domain/services/email-campaign.service';
import {
  ChartEmailCampaignDto,
  CreateEmailCampaignDto,
  DeleteEmailCampaignDto,
  FindAllEmailCampaignDto,
  FindOneEmailCampaignDto,
  UpdateEmailCampaignDto,
  WidgetEmailCampaignDto,
} from '../dtos/email-campaign.dto';

@Controller()
export class EmailCampaignController {
  @Inject('CAMPAIGN_EMAIL_CAMPAIGN_SERVICE')
  private readonly emailCampaignService: EmailCampaignService;

  @MessagePattern('MS_CAMPAIGN_CREATE_EMAIL_CAMPAIGN')
  create(@Payload() createEmailCampaignDto: CreateEmailCampaignDto) {
    return this.emailCampaignService.create(createEmailCampaignDto);
  }

  @MessagePattern('MS_CAMPAIGN_FIND_ALL_EMAIL_CAMPAIGN')
  findAll(@Payload() findAllEmailCampaignDto: FindAllEmailCampaignDto) {
    return this.emailCampaignService.findAll(findAllEmailCampaignDto);
  }

  @MessagePattern('MS_CAMPAIGN_FIND_ALL_COUNT_EMAIL_CAMPAIGN')
  findAllCount(@Payload() findAllEmailCampaignDto: FindAllEmailCampaignDto) {
    return this.emailCampaignService.findAllCount(findAllEmailCampaignDto);
  }

  @MessagePattern('MS_CAMPAIGN_FIND_ONE_EMAIL_CAMPAIGN')
  findOne(@Payload() findOneEmailCampaignDto: FindOneEmailCampaignDto) {
    return this.emailCampaignService.findOne(findOneEmailCampaignDto);
  }

  @MessagePattern('MS_CAMPAIGN_UPDATE_EMAIL_CAMPAIGN')
  update(@Payload() updateEmailCampaignDto: UpdateEmailCampaignDto) {
    return this.emailCampaignService.update(updateEmailCampaignDto);
  }

  @MessagePattern('MS_CAMPAIGN_REMOVE_EMAIL_CAMPAIGN')
  remove(@Payload() deleteEmailCampaignDto: DeleteEmailCampaignDto) {
    return this.emailCampaignService.remove(deleteEmailCampaignDto);
  }

  @MessagePattern('MS_CAMPAIGN_WIDGET_EMAIL_CAMPAIGN')
  widget(@Payload() widgetEmailCampaignDto: WidgetEmailCampaignDto) {
    return this.emailCampaignService.widget(widgetEmailCampaignDto);
  }

  @MessagePattern('MS_CAMPAIGN_CHART_EMAIL_CAMPAIGN')
  chart(@Payload() chartEmailCampaignDto: ChartEmailCampaignDto) {
    return this.emailCampaignService.chart(chartEmailCampaignDto);
  }
}
