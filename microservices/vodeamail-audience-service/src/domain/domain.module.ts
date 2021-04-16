import { Module, Provider } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactService } from './services/contact.service';
import { GroupService } from './services/group.service';
import { Contact } from './entities/contact.entity';
import { Group } from './entities/group.entity';
import { ContactGroup } from './entities/contact-group.entity';

const providers: Provider[] = [
  {
    provide: 'AUDIENCE_GROUP_SERVICE',
    useClass: GroupService,
  },
  {
    provide: 'AUDIENCE_CONTACT_SERVICE',
    useClass: ContactService,
  },
];

@Module({
  imports: [
    InfrastructureModule,
    TypeOrmModule.forFeature([Contact, ContactGroup, Group]),
  ],
  providers: [...providers],
  exports: [...providers],
})
export class DomainModule {}
