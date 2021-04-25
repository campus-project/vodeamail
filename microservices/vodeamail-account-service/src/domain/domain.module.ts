import { Module, Provider } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './services/user.service';
import { OrganizationService } from './services/organization.service';
import { RoleService } from './services/role.service';

import { Organization } from './entities/organization.entity';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';

import { SummaryRoleView } from './views/summary-role.view';

const providers: Provider[] = [
  {
    provide: 'ACCOUNT_ORGANIZATION_SERVICE',
    useClass: OrganizationService,
  },
  {
    provide: 'ACCOUNT_ROLE_SERVICE',
    useClass: RoleService,
  },
  {
    provide: 'ACCOUNT_USER_SERVICE',
    useClass: UserService,
  },
];

@Module({
  imports: [
    InfrastructureModule,
    TypeOrmModule.forFeature([Organization, Role, User, SummaryRoleView]),
  ],
  providers: [...providers],
  exports: [...providers],
})
export class DomainModule {}
