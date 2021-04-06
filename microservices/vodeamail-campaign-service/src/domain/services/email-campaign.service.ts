import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
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
    const queryBuilder = buildFindAllQueryOption({ options });

    if (options.organization_id !== undefined) {
      Object.assign(queryBuilder.where, {
        organization_id: options.organization_id,
      });
    }

    return await this.emailCampaignRepository.find(queryBuilder);
  }

  async findOne(options: FindOneEmailCampaignDto): Promise<EmailCampaign> {
    const queryBuilder = buildFindOneQueryOption({ options });

    if (options.organization_id !== undefined) {
      Object.assign(queryBuilder.where, {
        organization_id: options.organization_id,
      });
    }

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
      }),
    );

    for (const group_id of group_ids) {
      await this.emailCampaignRepository.save(
        this.emailCampaignGroupRepository.create({
          group_id,
          email_campaign: emailCampaign,
        }),
      );
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
      group_ids,
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
    });

    await this.emailCampaignRepository.save(emailCampaign);

    //delete old group ids
    await this.emailCampaignGroupRepository.delete({
      email_campaign_id: id,
    });

    for (const group_id of group_ids) {
      await this.emailCampaignRepository.save(
        this.emailCampaignGroupRepository.create({
          group_id,
          email_campaign: emailCampaign,
        }),
      );
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
    const { id, ids, is_hard, organization_id } = deleteEmailCampaignDto;

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
      await this.emailCampaignRepository.softRemove(emailCampaigns);
    }

    return emailCampaigns.length;
  }
}
