import { Inject, Injectable } from '@nestjs/common';
import { Brackets, In, Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { buildFindAllQueryBuilder } from 'vnest-core';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import * as _ from 'lodash';

import {
  CreateEmailCampaignDto,
  DeleteEmailCampaignDto,
  FindAllEmailCampaignDto,
  FindOneEmailCampaignDto,
  UpdateEmailCampaignDto,
} from '../../application/dtos/email-campaign.dto';
import { EmailCampaign } from '../entities/email-campaign.entity';
import { EmailCampaignGroup } from '../entities/email-campaign-group.entity';
import { EmailCampaignAudience } from '../entities/email-campaign-audience.entity';
import { EmailTemplate } from '../entities/email-template.entity';

@Injectable()
export class EmailCampaignService {
  constructor(
    @InjectRepository(EmailCampaign)
    private readonly emailCampaignRepository: Repository<EmailCampaign>,
    @InjectRepository(EmailCampaignGroup)
    private readonly emailCampaignGroupRepository: Repository<EmailCampaignGroup>,
    @InjectRepository(EmailCampaignAudience)
    private readonly emailCampaignAudienceRepository: Repository<EmailCampaignAudience>,
    @InjectRepository(EmailTemplate)
    private readonly emailTemplateRepository: Repository<EmailTemplate>,
    @Inject('REDIS_TRANSPORT')
    private readonly redisClient: ClientProxy,
  ) {}

  async findAll(options: FindAllEmailCampaignDto): Promise<EmailCampaign[]> {
    const { relations } = options;
    const qb = this.emailCampaignRepository
      .createQueryBuilder('email_campaigns')
      .select('email_campaigns.*')
      .addSelect('summary_email_campaigns.total_group', 'total_group')
      .addSelect('summary_email_campaigns.total_audience', 'total_audience')
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

        return emailCampaign;
      });
    }

    return data;
  }

  async findAllCount(options: FindAllEmailCampaignDto): Promise<number> {
    const qb = this.emailCampaignRepository
      .createQueryBuilder('email_campaigns')
      .select('email_campaigns.*')
      .addSelect('summary_email_campaigns.total_group', 'total_group')
      .addSelect('summary_email_campaigns.total_audience', 'total_audience')
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

    if (group_ids.length) {
      const groups = await this.redisClient
        .send('MS_AUDIENCE_FIND_ALL_GROUP', {
          ids: group_ids,
          organization_id,
        })
        .toPromise();

      for (const group of groups) {
        await this.emailCampaignGroupRepository.save(
          this.emailCampaignGroupRepository.create({
            group_id: group.id,
            email_campaign: emailCampaign,
          }),
        );
      }

      const organizationTags = await this.makeOrganizationTag(organization_id);

      const contacts = await this.redisClient
        .send('MS_AUDIENCE_FIND_ALL_CONTACT', {
          group_ids,
          organization_id,
        })
        .toPromise();

      for (const contact of contacts) {
        const contactTags = this.makeContactTag(contact, organizationTags);

        await this.emailCampaignAudienceRepository.save(
          this.emailCampaignAudienceRepository.create({
            email: contact.email,
            email_campaign: emailCampaign,
            value_tags: JSON.stringify(contactTags),
            html: this.tagReplace(email_template_html, contactTags),
          }),
        );
      }
    }

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

    await this.emailCampaignGroupRepository.delete({ email_campaign_id: id });
    await this.emailCampaignAudienceRepository.delete({
      email_campaign_id: id,
    });

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

    if (group_ids.length) {
      const groups = await this.redisClient
        .send('MS_AUDIENCE_FIND_ALL_GROUP', {
          ids: group_ids,
          organization_id,
        })
        .toPromise();

      for (const group of groups) {
        await this.emailCampaignGroupRepository.save(
          this.emailCampaignGroupRepository.create({
            group_id: group.id,
            email_campaign: emailCampaign,
          }),
        );
      }

      const organizationTags = await this.makeOrganizationTag(organization_id);

      const contacts = await this.redisClient
        .send('MS_AUDIENCE_FIND_ALL_CONTACT', {
          group_ids,
          organization_id,
        })
        .toPromise();

      for (const contact of contacts) {
        const contactTags = this.makeContactTag(contact, organizationTags);

        await this.emailCampaignAudienceRepository.save(
          this.emailCampaignAudienceRepository.create({
            email: contact.email,
            email_campaign: emailCampaign,
            value_tags: JSON.stringify(contactTags),
            html: this.tagReplace(email_template_html, contactTags),
          }),
        );
      }
    }

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

  protected async makeOrganizationTag(organizationId: string) {
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

  protected makeContactTag(contact, organizationTags) {
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

    Object.assign(contactTags, organizationTags);

    return contactTags;
  }

  protected tagReplace(templateHtml: string, search) {
    Object.keys(search).forEach((key) => {
      templateHtml = templateHtml.replace(
        new RegExp('{{ ' + key + ' }}'),
        search[key],
      );
    });

    return templateHtml;
  }

  protected makeFilter(
    builder: SelectQueryBuilder<EmailCampaign>,
    options: FindOneEmailCampaignDto | FindAllEmailCampaignDto,
  ) {
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
  ) {
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
