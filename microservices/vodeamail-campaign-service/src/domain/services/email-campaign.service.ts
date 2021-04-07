import { Injectable } from '@nestjs/common';
import { Brackets, In, IsNull, Repository } from 'typeorm';
import { EmailCampaign } from '../entities/email-campaign.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import {
  buildFindAllQueryOption,
  buildFindOneQueryOption,
} from '../../@vodea/typeorm';
import {
  CreateEmailCampaignDto,
  DeleteEmailCampaignDto,
  EmailCampaignGroupSyncDto,
  FindAllEmailCampaignDto,
  FindOneEmailCampaignDto,
  UpdateEmailCampaignDto,
} from '../../application/dtos/email-campaign.dto';
import { RpcException } from '@nestjs/microservices';
import { EmailCampaignGroup } from '../entities/email-campaign-group.entity';

@Injectable()
export class EmailCampaignService {
  constructor(
    @InjectRepository(EmailCampaign)
    private readonly emailCampaignRepository: Repository<EmailCampaign>,
    @InjectRepository(EmailCampaignGroup)
    private readonly emailCampaignGroupRepository: Repository<EmailCampaignGroup>,
  ) {}

  async findAll(options: FindAllEmailCampaignDto): Promise<EmailCampaign[]> {
    const queryBuilder = this.buildFindQuery(
      buildFindAllQueryOption({ options }),
      options,
    );

    return await this.emailCampaignRepository.find(queryBuilder);
  }

  async findAllCount(options: FindAllEmailCampaignDto): Promise<number> {
    const { search } = options;
    const { where, cache, take, skip } = this.buildFindQuery(
      buildFindAllQueryOption({ options }),
      options,
    );

    const builder = await this.emailCampaignRepository
      .createQueryBuilder('email_campaigns')
      .where(where)
      .cache(cache)
      .take(take)
      .skip(skip);

    if (search) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where(`email_campaigns.name LIKE "%${search}%"`)
            .orWhere(`email_campaigns.subject LIKE "%${search}%"`)
            .orWhere(`email_campaigns.from LIKE "%${search}%"`)
            .orWhere(`email_campaigns.email_from LIKE "%${search}%"`);
        }),
      );
    }

    return builder.getCount();
  }

  async findAllBuilder(
    options: FindAllEmailCampaignDto,
  ): Promise<EmailCampaign[]> {
    const { search } = options;
    const { where, cache, order, take, skip } = this.buildFindQuery(
      buildFindAllQueryOption({ options }),
      options,
    );

    const builder = await this.emailCampaignRepository
      .createQueryBuilder('email_campaigns')
      .select('email_campaigns.*')
      .where(where)
      .cache(cache)
      .orderBy(order)
      .take(take)
      .skip(skip);

    if (search) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where(`email_campaigns.name LIKE "%${search}%"`)
            .orWhere(`email_campaigns.subject LIKE "%${search}%"`)
            .orWhere(`email_campaigns.from LIKE "%${search}%"`)
            .orWhere(`email_campaigns.email_from LIKE "%${search}%"`);
        }),
      );
    }

    return builder.execute();
  }

  async findOne(options: FindOneEmailCampaignDto): Promise<EmailCampaign> {
    const queryBuilder = this.buildFindQuery(
      buildFindOneQueryOption({ options }),
      options,
    );

    return await this.emailCampaignRepository.findOne(queryBuilder);
  }

  @Transactional()
  async create(
    createEmailCampaignDto: CreateEmailCampaignDto,
  ): Promise<EmailCampaign> {
    const {
      id,
      organization_id,
      name,
      subject,
      from,
      email_from,
      sent_at,
      is_directly_scheduled,
      email_template_id,
      group_ids,
      actor_id: created_by,
    } = createEmailCampaignDto;

    const emailCampaign = await this.emailCampaignRepository.save(
      this.emailCampaignRepository.create({
        id,
        organization_id,
        name,
        subject,
        from,
        email_from,
        sent_at,
        is_directly_scheduled,
        email_template_id,
        created_by,
        updated_by: created_by,
      }),
    );

    await this.syncGroup({
      email_campaign_id: emailCampaign.id,
      group_ids,
      organization_id,
    });

    return this.findOne({
      id: emailCampaign.id,
      organization_id,
    });
  }

  @Transactional()
  async update(
    updateEmailCampaignDto: UpdateEmailCampaignDto,
  ): Promise<EmailCampaign> {
    const {
      id,
      organization_id,
      name,
      subject,
      from,
      email_from,
      sent_at,
      is_directly_scheduled,
      email_template_id,
      group_ids,
      actor_id: updated_by,
    } = updateEmailCampaignDto;

    const emailCampaign = await this.findOne({
      id,
      organization_id,
      relations: ['email_campaign_groups'],
    });

    if (!emailCampaign) {
      throw new RpcException(`Could not find resource ${id}.`);
    }

    Object.assign(emailCampaign, {
      organization_id,
      name,
      subject,
      from,
      email_from,
      sent_at,
      is_directly_scheduled,
      email_template_id,
      updated_by,
    });

    await this.emailCampaignRepository.save(emailCampaign);

    await this.syncGroup({
      email_campaign_id: emailCampaign.id,
      group_ids,
      organization_id,
    });

    return this.findOne({
      id: emailCampaign.id,
      organization_id,
    });
  }

  @Transactional()
  async remove(
    deleteEmailCampaignDto: DeleteEmailCampaignDto,
  ): Promise<number> {
    const {
      id,
      ids,
      is_hard,
      organization_id,
      actor_id: deleted_by,
    } = deleteEmailCampaignDto;

    const toBeDeleteIds = ids === undefined ? [] : ids;
    if (id !== undefined) {
      toBeDeleteIds.push(id);
    }

    const emailCampaigns = await this.emailCampaignRepository.find({
      where: {
        id: In(toBeDeleteIds),
        organization_id,
      },
    });

    if (is_hard) {
      await this.emailCampaignRepository.remove(emailCampaigns);
    } else {
      await this.emailCampaignRepository.save(
        emailCampaigns.map((emailCampaign) => {
          Object.assign(emailCampaign, {
            deleted_by,
            deleted_at: new Date().toISOString(),
          });

          return emailCampaign;
        }),
      );

      await this.emailCampaignRepository.softRemove(emailCampaigns);
    }

    return emailCampaigns.length;
  }

  protected async syncGroup(
    emailCampaignGroupSyncDto: EmailCampaignGroupSyncDto,
  ) {
    const {
      email_campaign_id,
      organization_id,
      group_ids,
    } = emailCampaignGroupSyncDto;

    const emailCampaign = await this.findOne({
      id: email_campaign_id,
      organization_id,
      relations: ['email_campaign_groups'],
    });

    if (!emailCampaign) {
      throw new RpcException(`Could not find resource ${email_campaign_id}.`);
    }

    const existsGroupIds = [];
    for (const emailCampaignGroup of emailCampaign.email_campaign_groups) {
      if (group_ids.includes(emailCampaignGroup.id)) {
        existsGroupIds.push(emailCampaignGroup.id);
      } else {
        await this.emailCampaignGroupRepository.delete(emailCampaignGroup);
      }
    }

    for (const group_id of group_ids) {
      if (!existsGroupIds.includes(group_id)) {
        await this.emailCampaignGroupRepository.save(
          this.emailCampaignGroupRepository.create({
            email_campaign_id,
            group_id: group_id,
          }),
        );
      }
    }
  }

  protected buildFindQuery(
    queryBuilder,
    options: FindOneEmailCampaignDto | FindAllEmailCampaignDto,
  ) {
    Object.assign(queryBuilder.where, {
      organization_id: options.organization_id || IsNull(),
    });

    return queryBuilder;
  }
}
