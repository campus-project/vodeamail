import { Inject, Injectable } from '@nestjs/common';
import { Brackets, In, Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { buildFindAllQueryBuilder } from 'vnest-core';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import {
  ChartEmailCampaignDto,
  CreateEmailCampaignDto,
  DeleteEmailCampaignDto,
  FindAllEmailCampaignDto,
  FindOneEmailCampaignDto,
  UpdateEmailCampaignDto,
  WidgetEmailCampaignDto,
} from '../../application/dtos/email-campaign.dto';
import { EmailCampaign } from '../entities/email-campaign.entity';
import { EmailCampaignGroup } from '../entities/email-campaign-group.entity';
import { EmailCampaignAudience } from '../entities/email-campaign-audience.entity';
import { EmailTemplate } from '../entities/email-template.entity';
import { SummaryEmailCampaignAnalyticView } from '../views/summary-email-campaign-analytic.view';
import { WidgetEmailCampaignView } from '../views/widget-email-campaign.view';
import { ChartEmailCampaignView } from '../views/chart-email-campaign.view';

@Injectable()
export class EmailCampaignService {
  @Inject('REDIS_TRANSPORT')
  private readonly redisClient: ClientProxy;

  //entity
  @InjectRepository(EmailCampaign)
  private readonly emailCampaignRepository: Repository<EmailCampaign>;

  @InjectRepository(EmailCampaignGroup)
  private readonly emailCampaignGroupRepository: Repository<EmailCampaignGroup>;

  @InjectRepository(EmailCampaignAudience)
  private readonly emailCampaignAudienceRepository: Repository<EmailCampaignAudience>;

  @InjectRepository(EmailTemplate)
  private readonly emailTemplateRepository: Repository<EmailTemplate>;

  //view
  @InjectRepository(SummaryEmailCampaignAnalyticView)
  private readonly summaryEmailCampaignAnalyticRepository: Repository<SummaryEmailCampaignAnalyticView>;

  @InjectRepository(WidgetEmailCampaignView)
  private readonly widgetEmailCampaignViewRepository: Repository<WidgetEmailCampaignView>;

  @InjectRepository(ChartEmailCampaignView)
  private readonly chartEmailCampaignViewRepository: Repository<ChartEmailCampaignView>;

  async findAll(options: FindAllEmailCampaignDto): Promise<EmailCampaign[]> {
    const { relations } = options;
    const qb = this.emailCampaignRepository
      .createQueryBuilder('email_campaigns')
      .select('email_campaigns.*')
      .addSelect('summary_email_campaigns.status', 'status')
      .addSelect('summary_email_campaigns.total_group', 'total_group')
      .addSelect('summary_email_campaigns.total_delivered', 'total_delivered')
      .addSelect('summary_email_campaigns.total_audience', 'total_audience')
      .addSelect('summary_email_campaigns.total_clicked', 'total_clicked')
      .addSelect('summary_email_campaigns.total_opened', 'total_opened')
      .addSelect('summary_email_campaigns.last_opened', 'last_opened')
      .addSelect('summary_email_campaigns.last_clicked', 'last_clicked')
      .addSelect(
        'summary_email_campaigns.avg_open_duration',
        'avg_open_duration',
      )
      .addSelect(
        'summary_email_campaigns.total_unsubscribe',
        'total_unsubscribe',
      )
      .leftJoin(
        'summary_email_campaigns',
        'summary_email_campaigns',
        '(summary_email_campaigns.email_campaign_id = email_campaigns.id)',
      );

    const builder = this.makeSearchable(
      this.makeFilter(buildFindAllQueryBuilder(qb, options), options),
      options,
    );

    let data = await builder.execute();

    //relations
    if (relations !== undefined && relations.length) {
      const emailCampaignIds = [];
      const emailTemplateIds = [];

      const relationValues = {
        groups: undefined,
        emailTemplates: undefined,
        summaryEmailCampaignAnalytics: undefined,
      };

      data.forEach((emailCampaign) => {
        emailCampaignIds.push(emailCampaign.id);
        emailTemplateIds.push(emailCampaign.email_template_id);
      });

      const mapEmailCampaignGroups = {};

      //email template
      if (relations.indexOf('email_template') !== -1) {
        relationValues.emailTemplates = await this.emailTemplateRepository.find(
          {
            where: { id: In([...new Set(emailTemplateIds)]) },
          },
        );
      }

      //groups
      if (relations.indexOf('groups') !== -1) {
        const emailCampaignGroups = await this.emailCampaignGroupRepository.find(
          { where: { email_campaign_id: In(emailCampaignIds) } },
        );

        const groupIds = [];
        emailCampaignGroups.forEach((emailCampaignGroup) => {
          if (
            typeof mapEmailCampaignGroups[
              emailCampaignGroup.email_campaign_id
            ] === 'undefined'
          ) {
            mapEmailCampaignGroups[emailCampaignGroup.email_campaign_id] = [];
          }

          mapEmailCampaignGroups[emailCampaignGroup.email_campaign_id].push(
            emailCampaignGroup.group_id,
          );

          groupIds.push(emailCampaignGroup.group_id);
        });

        relationValues.groups = await this.redisClient
          .send('MS_AUDIENCE_FIND_ALL_GROUP', {
            ids: groupIds,
            organization_id: options.organization_id,
          })
          .toPromise();
      }

      //summary email campaign analytic
      if (relations.indexOf('summary_email_campaign_analytics') !== -1) {
        relationValues.summaryEmailCampaignAnalytics = await this.summaryEmailCampaignAnalyticRepository.find(
          { where: { email_campaign_id: In(emailCampaignIds) } },
        );
      }

      data = data.map((emailCampaign) => {
        if (relationValues.emailTemplates !== undefined) {
          emailCampaign.email_template =
            relationValues.emailTemplates.find(
              (emailTemplate) =>
                emailTemplate.id === emailCampaign.email_template_id,
            ) || null;
        }

        if (relationValues.groups !== undefined) {
          const groups = [];

          if (typeof mapEmailCampaignGroups[emailCampaign.id] !== 'undefined') {
            const listGroupIds = mapEmailCampaignGroups[emailCampaign.id];

            if (Array.isArray(listGroupIds) && listGroupIds.length) {
              relationValues.groups.forEach((group) => {
                if (listGroupIds.includes(group.id)) {
                  groups.push(group);
                }
              });
            }
          }

          emailCampaign.groups = groups;
        }

        if (relationValues.summaryEmailCampaignAnalytics !== undefined) {
          emailCampaign.summary_email_campaign_analytics =
            relationValues.summaryEmailCampaignAnalytics.filter(
              (summaryEmailCampaignAnalytic) =>
                summaryEmailCampaignAnalytic.email_campaign_id ===
                emailCampaign.id,
            ) || [];
        }

        return emailCampaign;
      });
    }

    return data;
  }

  async findAllCount(options: FindAllEmailCampaignDto): Promise<number> {
    const qb = this.emailCampaignRepository
      .createQueryBuilder('email_campaigns')
      .select('email_campaigns.*')
      .leftJoin(
        'summary_email_campaigns',
        'summary_email_campaigns',
        '(summary_email_campaigns.email_campaign_id = email_campaigns.id)',
      );

    const builder = this.makeSearchable(
      this.makeFilter(buildFindAllQueryBuilder(qb, options), options),
      options,
    );

    return await builder.getCount();
  }

  async findOne(options: FindOneEmailCampaignDto): Promise<EmailCampaign> {
    const data = await this.findAll(options);

    return _.head(data);
  }

  async widget(widgetEmailCampaignDto: WidgetEmailCampaignDto) {
    return await this.widgetEmailCampaignViewRepository.findOne({
      where: { organization_id: widgetEmailCampaignDto.organization_id },
    });
  }

  async chart(chartEmailCampaignDto: ChartEmailCampaignDto) {
    return await this.chartEmailCampaignViewRepository.find({
      where: { organization_id: chartEmailCampaignDto.organization_id },
    });
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

    await this.syncEmailCampaignGroup(emailCampaign, group_ids);

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

    const emailCampaign = await this.emailCampaignRepository.findOne({
      where: { id, organization_id },
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

    await this.syncEmailCampaignGroup(emailCampaign, group_ids);

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

  protected async syncEmailCampaignGroup(
    emailCampaign: EmailCampaign,
    groupIds: string[],
  ): Promise<void> {
    const groups = groupIds.length
      ? await this.redisClient
          .send('MS_AUDIENCE_FIND_ALL_GROUP', {
            ids: groupIds,
            organization_id: emailCampaign.organization_id,
          })
          .toPromise()
      : [];

    const realGroupIds = groups.map((group) => group.id);
    const currentEmailCampaignGroups = await emailCampaign.email_campaign_groups;

    await this.emailCampaignGroupRepository.remove(
      currentEmailCampaignGroups.filter(
        (emailCampaignGroup) =>
          !realGroupIds.includes(emailCampaignGroup.group_id),
      ),
    );

    for (const group of groups) {
      if (
        currentEmailCampaignGroups.findIndex(
          (emailCampaignGroup) => emailCampaignGroup.group_id === group.id,
        ) === -1
      )
        await this.emailCampaignGroupRepository.save(
          this.emailCampaignGroupRepository.create({
            group_id: group.id,
            email_campaign: emailCampaign,
            total_contact: group.total_contact || 0,
          }),
        );
    }

    const contacts = realGroupIds.length
      ? await this.redisClient
          .send('MS_AUDIENCE_FIND_ALL_CONTACT', {
            group_ids: realGroupIds,
            organization_id: emailCampaign.organization_id,
          })
          .toPromise()
      : [];

    const realContactIds = contacts.map((contact) => contact.id);
    const currentEmailCampaignAudiences = await emailCampaign.email_campaign_audiences;

    await this.emailCampaignAudienceRepository.remove(
      currentEmailCampaignAudiences.filter(
        (emailCampaignAudience) =>
          !realContactIds.includes(emailCampaignAudience.contact_id),
      ),
    );

    let valueTags = await this.makeOrganizationTag(
      emailCampaign.organization_id,
    );

    for (const contact of contacts) {
      if (
        currentEmailCampaignAudiences.findIndex(
          (emailCampaignAudience) =>
            emailCampaignAudience.contact_id === contact.id,
        ) === -1
      ) {
        if (contact.is_subscribed) {
          const emailCampaignAudienceId = uuidv4();

          valueTags = this.makeContactTag(contact, valueTags);
          valueTags = this.makeSettingTag(emailCampaignAudienceId, valueTags);

          await this.emailCampaignAudienceRepository.save(
            this.emailCampaignAudienceRepository.create({
              id: emailCampaignAudienceId,
              contact_id: contact.id,
              to: contact.name,
              email_to: contact.email,
              email_campaign: emailCampaign,
              value_tags: JSON.stringify(valueTags),
              html: this.tagReplace(
                emailCampaign.email_template_html,
                valueTags,
              ),
            }),
          );
        }
      }
    }
  }

  protected async makeOrganizationTag(organizationId: string): Promise<any> {
    const organization = await this.redisClient
      .send('MS_ACCOUNT_FIND_ONE_ORGANIZATION', {
        id: organizationId,
      })
      .toPromise();

    if (!organization) {
      throw new RpcException(`Could not find organization ${organizationId}.`);
    }

    return {
      org_name: organization.name,
      org_address: organization.address,
      org_telephone: organization.telephone,
      org_fax: organization.fax,
    };
  }

  protected makeContactTag(contact, valueTags): any {
    const contactTags = {
      email: contact.email,
      name: contact.name,
      mobile_phone: contact.mobile_phone,
      address_line_1: contact.address_line_1,
      address_line_2: contact.address_line_2,
      country: contact.country,
      province: contact.province,
      city: contact.city,
      postal_code: contact.postal_code,
    };

    Object.assign(contactTags, valueTags);

    return contactTags;
  }

  protected makeSettingTag(emailCampaignAudienceId, valueTags): any {
    const settingTags = {
      unsubscribe_url: `<a href="http://localhost:3010/a/u?ref=${encodeURIComponent(
        emailCampaignAudienceId,
      )}">Unsubscribe</a>`,
    };

    Object.assign(settingTags, valueTags);

    return settingTags;
  }

  protected tagReplace(templateHtml: string, search): string {
    Object.keys(search).forEach((key) => {
      templateHtml = templateHtml.replace(
        new RegExp('{{ ' + key + ' }}', 'mg'),
        search[key],
      );
    });

    return templateHtml;
  }

  protected makeFilter(
    builder: SelectQueryBuilder<EmailCampaign>,
    options: FindOneEmailCampaignDto | FindAllEmailCampaignDto,
  ): SelectQueryBuilder<EmailCampaign> {
    const {
      organization_id: organizationId,
      group_id: groupId,
      group_ids: groupIds,
    } = options;

    builder.andWhere(
      new Brackets((qb) => {
        qb.where('email_campaigns.organization_id = :organizationId', {
          organizationId,
        }).orWhere('email_campaigns.organization_id IS NULL');
      }),
    );

    const filterGroupIds = groupId === undefined ? [] : [groupId];
    if (groupIds !== undefined) {
      filterGroupIds.push(...groupIds);
    }

    if (filterGroupIds.length) {
      const queryExists = this.emailCampaignGroupRepository
        .createQueryBuilder('email_campaign_groups')
        .where('email_campaign_groups.email_campaign_id = email_campaigns.id')
        .andWhere('email_campaign_groups.group_id IN (:...filterGroupIds)', {
          filterGroupIds,
        });

      builder.andWhere(
        `EXISTS (${queryExists.getQuery()})`,
        queryExists.getParameters(),
      );
    }

    return builder;
  }

  protected makeSearchable(
    builder: SelectQueryBuilder<EmailCampaign>,
    { search }: FindAllEmailCampaignDto,
  ): SelectQueryBuilder<EmailCampaign> {
    if (search) {
      const params = { search: `%${search}%` };
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('email_campaigns.name LIKE :search', params)
            .orWhere('email_campaigns.subject LIKE :search', params)
            .orWhere('email_campaigns.from LIKE :search', params)
            .orWhere('email_campaigns.email_from LIKE :search', params);
        }),
      );
    }

    return builder;
  }
}
