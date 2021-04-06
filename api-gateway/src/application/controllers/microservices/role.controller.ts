import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { clientProxyException } from '../../../@vodea/microservices';
import { User } from '../../../@vodea/decorators/user.decorator';
import {
  buildFindAllPayload,
  paginationTransformer,
} from '../../../@vodea/helpers';
import { FindAllQueryDto } from '../../../@vodea/dtos/find-all-query.dto';

@Controller('role')
export class RoleController {
  constructor(
    @Inject('REDIS_TRANSPORT')
    private readonly redisClient: ClientProxy,
  ) {}

  @Get()
  async findAll(
    @User('organization_id') organizationId: string,
    @Query() query: FindAllQueryDto,
  ) {
    const payload = buildFindAllPayload(query, {
      organization_id: organizationId,
    });

    const data = await this.redisClient
      .send(
        payload.using === 'builder'
          ? 'MS_ACCOUNT_FIND_ALL_BUILDER_ROLE'
          : 'MS_ACCOUNT_FIND_ALL_ROLE',
        payload,
      )
      .toPromise()
      .catch(clientProxyException);

    if (query.per_page === undefined) {
      return { data };
    }

    const total = await this.redisClient
      .send('MS_ACCOUNT_FIND_ALL_COUNT_ROLE', payload)
      .toPromise()
      .catch(clientProxyException);

    return paginationTransformer(data, total);
  }

  @Get(':id')
  async findOne(
    @User('organization_id') organizationId: string,
    @Param('id') id: string,
  ) {
    const data = await this.redisClient
      .send('MS_ACCOUNT_FIND_ONE_ROLE', {
        organization_id: organizationId,
        id,
      })
      .toPromise()
      .catch(clientProxyException);

    if (!data) {
      throw new NotFoundException(`Could not find resource ${id}.`);
    }

    return { data };
  }

  @Post()
  async create(
    @User('organization_id') organizationId: string,
    @Body() createRoleDto,
  ) {
    const data = await this.redisClient
      .send('MS_ACCOUNT_CREATE_ROLE', {
        ...createRoleDto,
        organization_id: organizationId,
      })
      .toPromise()
      .catch(clientProxyException);

    return { data };
  }

  @Put(':id')
  async update(
    @User('organization_id') organizationId: string,
    @Param('id') id: string,
    @Body() updateRoleDto,
  ) {
    const data = await this.redisClient
      .send('MS_ACCOUNT_UPDATE_ROLE', {
        ...updateRoleDto,
        organization_id: organizationId,
        id,
      })
      .toPromise()
      .catch(clientProxyException);

    return { data };
  }

  @Delete(':id')
  async remove(
    @User('organization_id') organizationId: string,
    @Param('id') id: string,
  ) {
    const data = await this.redisClient
      .send('MS_ACCOUNT_REMOVE_ROLE', {
        organization_id: organizationId,
        id,
      })
      .toPromise()
      .catch(clientProxyException);

    return { data };
  }
}
