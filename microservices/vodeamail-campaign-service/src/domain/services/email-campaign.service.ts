import { Inject, Injectable } from '@nestjs/common';
import { Brackets, In, IsNull, Repository } from 'typeorm';
import { EmailCampaign } from '../entities/email-campaign.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { buildFindAllQueryOption, buildFindOneQueryOption } from 'vnest-core';
import {
  CreateEmailCampaignDto,
  DeleteEmailCampaignDto,
  EmailCampaignGroupSyncDto,
  FindAllEmailCampaignDto,
  FindOneEmailCampaignDto,
  UpdateEmailCampaignDto,
} from '../../application/dtos/email-campaign.dto';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { EmailCampaignGroup } from '../entities/email-campaign-group.entity';
import * as moment from 'moment';

@Injectable()
export class EmailCampaignService {
  constructor(
    @InjectRepository(EmailCampaign)
    private readonly emailCampaignRepository: Repository<EmailCampaign>,
    @InjectRepository(EmailCampaignGroup)
    private readonly emailCampaignGroupRepository: Repository<EmailCampaignGroup>,
    @Inject('REDIS_TRANSPORT')
    private readonly redisClient: ClientProxy,
  ) {}

  async findAll(options: FindAllEmailCampaignDto): Promise<EmailCampaign[]> {
    const { search, status } = options;
    const queryBuilder = this.buildFindQuery(
      buildFindAllQueryOption({ options }),
      options,
    );

    const relationGroupIndex = queryBuilder.relations.indexOf('groups');
    if (relationGroupIndex !== -1) {
      queryBuilder.relations.splice(relationGroupIndex, 1);
      queryBuilder.relations.push('email_campaign_groups');
    }

    if (status !== undefined) {
      Object.assign(queryBuilder.where, {
        status,
      });
    }

    if (search) {
      const whereClause = queryBuilder.where;
      queryBuilder.where = new Brackets((qb) => {
        Object.keys(whereClause).forEach((key) => {
          qb.where({ [key]: whereClause[key] });
        });

        qb.where(
          new Brackets((qb1) => {
            qb1
              .where('`name` LIKE ' + `"%${search}%"`)
              .orWhere('`subject` LIKE ' + `"%${search}%"`)
              .orWhere('`from` LIKE ' + `"%${search}%"`)
              .orWhere('`email_from` LIKE ' + `"%${search}%"`);
          }),
        );
      });
    }

    const emailCampaigns = await this.emailCampaignRepository.find(
      queryBuilder,
    );

    //insert groups
    if (relationGroupIndex !== -1) {
      const mapEmailCampaignGroups: any = {};
      const emailCampaignGroups = emailCampaigns.map((emailCampaign) => {
        const temp = emailCampaign.email_campaign_groups.map((a) => a.group_id);
        mapEmailCampaignGroups[emailCampaign.id] = temp;

        return temp;
      });

      const groupIds = Array.prototype.concat.apply([], emailCampaignGroups);
      const allGroups = await this.redisClient
        .send('MS_AUDIENCE_FIND_ALL_GROUP', {
          ids: groupIds,
          organization_id: options.organization_id,
        })
        .toPromise();

      emailCampaigns.map((emailCampaign) => {
        const mapEmailCampaignGroup = mapEmailCampaignGroups[emailCampaign.id];
        const groups = allGroups.filter((group) =>
          mapEmailCampaignGroup.includes(group.id),
        );

        Object.assign(emailCampaign, {
          groups,
        });

        return emailCampaign;
      });
    }

    return emailCampaigns;
  }

  async findAllCount(options: FindAllEmailCampaignDto): Promise<number> {
    const { search, with_deleted: withDeleted, status } = options;
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

    if (withDeleted) {
      builder.withDeleted();
    }

    if (status !== undefined && !isNaN(parseInt(String(status)))) {
      builder.where('`email_campaigns`.`status` = ' + `"${status}"`);
    }

    if (search) {
      builder.where('`email_campaigns`.`status` = ' + `"${status}"`);

      builder.andWhere(
        new Brackets((qb) => {
          qb.where('`email_campaigns`.`name` LIKE ' + `"%${search}%"`)
            .orWhere('`email_campaigns`.`subject` LIKE ' + `"%${search}%"`)
            .orWhere('`email_campaigns`.`from` LIKE ' + `"%${search}%"`)
            .orWhere('`email_campaigns`.`email_from` LIKE ' + `"%${search}%"`);
        }),
      );
    }

    return builder.getCount();
  }

  async findAllBuilder(
    options: FindAllEmailCampaignDto,
  ): Promise<EmailCampaign[]> {
    const { search, with_deleted: withDeleted, status } = options;
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

    if (withDeleted) {
      builder.withDeleted();
    }

    if (status !== undefined && !isNaN(parseInt(String(status)))) {
      builder.where('`email_campaigns`.`status` = ' + `"${status}"`);
    }

    if (search) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('`email_campaigns`.`name` LIKE ' + `"%${search}%"`)
            .orWhere('`email_campaigns`.`subject` LIKE ' + `"%${search}%"`)
            .orWhere('`email_campaigns`.`from` LIKE ' + `"%${search}%"`)
            .orWhere('`email_campaigns`.`email_from` LIKE ' + `"%${search}%"`);
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

    const relationGroupIndex = queryBuilder.relations.indexOf('groups');
    if (relationGroupIndex !== -1) {
      queryBuilder.relations.splice(relationGroupIndex, 1);
      queryBuilder.relations.push('email_campaign_groups');
    }

    const emailCampaign = await this.emailCampaignRepository.findOne(
      queryBuilder,
    );

    //insert groups
    if (relationGroupIndex !== -1) {
      const groups = await this.redisClient
        .send('MS_AUDIENCE_FIND_ALL_GROUP', {
          ids: (emailCampaign.email_campaign_groups || []).map(
            (a) => a.group_id,
          ),
          organization_id: options.organization_id,
        })
        .toPromise();

      Object.assign(emailCampaign, { groups });
    }

    return emailCampaign;
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
      email_template_html,
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
        email_template_html,
        created_by,
        updated_by: created_by,
      }),
    );

    await this.syncGroup({
      email_campaign_id: emailCampaign.id,
      group_ids,
      organization_id,
    });

    await this.createEmailJobs({
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
      email_template_html,
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
      email_template_html,
      updated_by,
    });

    await this.emailCampaignRepository.save(emailCampaign);

    await this.syncGroup({
      email_campaign_id: emailCampaign.id,
      group_ids,
      organization_id,
    });

    await this.createEmailJobs({
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

  protected async createEmailJobs(
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

    const now = moment();
    const sentAt = moment(emailCampaign.sent_at);
    if (now.diff(sentAt, 'days', true) < 0) {
      return;
    }

    //todo:get contact by group ids
    console.log(group_ids);
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
