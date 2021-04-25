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
import {
  FindAllQueryDto,
  FindOneQueryDto,
  Gate,
  paginationTransformer,
  User,
} from 'vnest-core';
import { FindOneEmailCampaignQueryDto } from '../dtos/microservices/email-campaign.dto';
import { GateSettingService } from '../../domain/services/gate-setting.service';
import { FindAllGateSettingQueryDto } from '../dtos/gate-setting.dto';

@Controller('gate-setting')
export class GateSettingController {
  @Inject('AUTH_GATE_SETTING_SERVICE')
  private readonly gateSettingService: GateSettingService;

  @Get()
  @Gate('gate-setting-index')
  async findAll(
    @User('organization_id') organizationId: string,
    @Query() query: FindAllGateSettingQueryDto,
  ) {
    const payload = this.buildFindAllPayload(query, {
      organization_id: organizationId,
    });

    const data = await this.gateSettingService.findAll(payload);

    if (query.per_page === undefined) {
      return { data };
    }

    const total = await this.gateSettingService.findAllCount(payload);

    return paginationTransformer(data, total);
  }

  @Get(':id')
  async findOne(
    @User('organization_id') organizationId: string,
    @Param('id') id: string,
    @Query() query: FindOneEmailCampaignQueryDto,
  ) {
    const payload = this.buildFindOnePayload(query, {
      organization_id: organizationId,
    });

    const data = await this.gateSettingService.findOne(payload);

    if (!data) {
      throw new NotFoundException(`Could not find resource ${id}.`);
    }

    return { data };
  }

  @Post()
  async create(
    @User('id') userId: string,
    @User('organization_id') organizationId: string,
    @Body() createContactDto,
  ) {
    const data = await this.gateSettingService.create({
      ...createContactDto,
      actor_id: userId,
      organization_id: organizationId,
    });

    return { data };
  }

  @Put(':id')
  async update(
    @User('id') userId: string,
    @User('organization_id') organizationId: string,
    @Param('id') id: string,
    @Body() updateContactDto,
  ) {
    const data = await this.gateSettingService.update({
      ...updateContactDto,
      actor_id: userId,
      organization_id: organizationId,
      id,
    });

    return { data };
  }

  @Delete(':id')
  async remove(
    @User('id') userId: string,
    @User('organization_id') organizationId: string,
    @Param('id') id: string,
  ) {
    const data = await this.gateSettingService.remove({
      actor_id: userId,
      organization_id: organizationId,
      id,
    });

    return { data };
  }

  protected buildFindAllPayload = (
    query: FindAllQueryDto,
    params: any = {},
  ) => {
    const {
      search,
      relations,
      per_page,
      page,
      order_by,
      sorted_by,
      with_deleted,
    } = query;

    const perPageValue = parseInt(per_page);
    const pageValue = parseInt(page);

    Object.assign(params, {
      search,
      relations,
      per_page: isNaN(perPageValue) ? undefined : perPageValue,
      page: isNaN(pageValue) ? undefined : pageValue,
      order_by,
      sorted_by,
      with_deleted:
        with_deleted === undefined
          ? undefined
          : ['true', '1'].includes(with_deleted.toLowerCase()),
    });

    return params;
  };

  protected buildFindOnePayload = (
    query: FindOneQueryDto,
    params: any = {},
  ) => {
    const { relations, with_deleted } = query;

    Object.assign(params, {
      relations,
      with_deleted:
        with_deleted === undefined
          ? undefined
          : ['true', '1'].includes(with_deleted.toLowerCase()),
    });

    return params;
  };
}
