import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SentEmailService } from '../../domain/services/sent-email.service';
import {
  CreateSentEmailDto,
  FindAllSentEmailDto,
  FindOneSentEmailDto,
} from '../dtos/sent-email.dto';

@Controller()
export class SentEmailController {
  constructor(
    @Inject('MAILER_SENT_EMAIL_SERVICE')
    private readonly sentEmailService: SentEmailService,
  ) {}

  @MessagePattern('MS_MAILER_CREATE_EMAIL_CAMPAIGN')
  create(@Payload() createEmailCampaignDto: CreateSentEmailDto) {
    return this.sentEmailService.create(createEmailCampaignDto);
  }

  @MessagePattern('MS_MAILER_FIND_ALL_EMAIL_CAMPAIGN')
  findAll(@Payload() findAllEmailCampaignDto: FindAllSentEmailDto) {
    return this.sentEmailService.findAll(findAllEmailCampaignDto);
  }

  @MessagePattern('MS_MAILER_FIND_ALL_COUNT_EMAIL_CAMPAIGN')
  findAllCount(@Payload() findAllEmailCampaignDto: FindAllSentEmailDto) {
    return this.sentEmailService.findAllCount(findAllEmailCampaignDto);
  }

  @MessagePattern('MS_MAILER_FIND_ONE_EMAIL_CAMPAIGN')
  findOne(@Payload() findOneEmailCampaignDto: FindOneSentEmailDto) {
    return this.sentEmailService.findOne(findOneEmailCampaignDto);
  }
}
