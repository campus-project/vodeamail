import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EmailTemplateService } from '../../domain/services/email-template.service';
import {
  CreateEmailTemplateDto,
  DeleteEmailTemplateDto,
  FindAllEmailTemplateDto,
  FindOneEmailTemplateDto,
  UpdateEmailTemplateDto,
} from '../dtos/email-template.dto';

@Controller()
export class EmailTemplateController {
  constructor(
    @Inject('CAMPAIGN_EMAIL_TEMPLATE_SERVICE')
    private readonly emailTemplate: EmailTemplateService,
  ) {}

  @MessagePattern('MS_CAMPAIGN_CREATE_EMAIL_TEMPLATE')
  create(@Payload() createEmailTemplateDto: CreateEmailTemplateDto) {
    return this.emailTemplate.create(createEmailTemplateDto);
  }

  @MessagePattern('MS_CAMPAIGN_FIND_ALL_EMAIL_TEMPLATE')
  findAll(@Payload() findAllEmailTemplateDto: FindAllEmailTemplateDto) {
    return this.emailTemplate.findAll(findAllEmailTemplateDto);
  }

  @MessagePattern('MS_CAMPAIGN_FIND_ALL_COUNT_EMAIL_TEMPLATE')
  findAllCount(@Payload() findAllEmailTemplateDto: FindAllEmailTemplateDto) {
    return this.emailTemplate.findAllCount(findAllEmailTemplateDto);
  }

  @MessagePattern('MS_CAMPAIGN_FIND_ALL_BUILDER_EMAIL_TEMPLATE')
  findAllBuilder(@Payload() findAllEmailTemplateDto: FindAllEmailTemplateDto) {
    return this.emailTemplate.findAllBuilder(findAllEmailTemplateDto);
  }

  @MessagePattern('MS_CAMPAIGN_FIND_ONE_EMAIL_TEMPLATE')
  findOne(@Payload() findOneEmailTemplateDto: FindOneEmailTemplateDto) {
    return this.emailTemplate.findOne(findOneEmailTemplateDto);
  }

  @MessagePattern('MS_CAMPAIGN_UPDATE_EMAIL_TEMPLATE')
  update(@Payload() updateEmailTemplateDto: UpdateEmailTemplateDto) {
    return this.emailTemplate.update(updateEmailTemplateDto);
  }

  @MessagePattern('MS_CAMPAIGN_REMOVE_EMAIL_TEMPLATE')
  remove(@Payload() deleteEmailTemplateDto: DeleteEmailTemplateDto) {
    return this.emailTemplate.remove(deleteEmailTemplateDto);
  }
}
