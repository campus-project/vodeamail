import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ContactService } from '../../domain/services/contact.service';
import {
  CreateContactDto,
  DeleteContactDto,
  FindAllContactDto,
  FindOneContactDto,
  UpdateContactDto,
  UpdateSubscriptionContactDto,
} from '../dtos/contact.dto';

@Controller()
export class ContactController {
  @Inject('AUDIENCE_CONTACT_SERVICE')
  private readonly contactService: ContactService;

  @MessagePattern('MS_AUDIENCE_CREATE_CONTACT')
  create(@Payload() createContactDto: CreateContactDto) {
    return this.contactService.create(createContactDto);
  }

  @MessagePattern('MS_AUDIENCE_FIND_ALL_CONTACT')
  findAll(@Payload() findAllContactDto: FindAllContactDto) {
    return this.contactService.findAll(findAllContactDto);
  }

  @MessagePattern('MS_AUDIENCE_FIND_ALL_COUNT_CONTACT')
  findAllCount(@Payload() findAllContactDto: FindAllContactDto) {
    return this.contactService.findAllCount(findAllContactDto);
  }

  @MessagePattern('MS_AUDIENCE_FIND_ONE_CONTACT')
  findOne(@Payload() findOneContactDto: FindOneContactDto) {
    return this.contactService.findOne(findOneContactDto);
  }

  @MessagePattern('MS_AUDIENCE_UPDATE_CONTACT')
  update(@Payload() updateContactDto: UpdateContactDto) {
    return this.contactService.update(updateContactDto);
  }

  @MessagePattern('MS_AUDIENCE_REMOVE_CONTACT')
  remove(@Payload() deleteContactDto: DeleteContactDto) {
    return this.contactService.remove(deleteContactDto);
  }

  @MessagePattern('MS_AUDIENCE_UPDATE_SUBSCRIPTION_CONTACT')
  updateSubscription(
    @Payload() updateSubscriptionContactDto: UpdateSubscriptionContactDto,
  ) {
    return this.contactService.updateSubscription(updateSubscriptionContactDto);
  }
}
