import { Injectable } from '@nestjs/common';
import { Brackets, In, Repository, SelectQueryBuilder } from 'typeorm';
import { EmailTemplate } from '../entities/email-template.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import {
  CreateEmailTemplateDto,
  DeleteEmailTemplateDto,
  FindAllEmailTemplateDto,
  FindOneEmailTemplateDto,
  UpdateEmailTemplateDto,
} from '../../application/dtos/email-template.dto';
import { RpcException } from '@nestjs/microservices';
import { buildFindAllQueryBuilder } from 'vnest-core';
import * as _ from 'lodash';

@Injectable()
export class EmailTemplateService {
  //entity
  @InjectRepository(EmailTemplate)
  private readonly emailTemplateRepository: Repository<EmailTemplate>;

  async findAll(options: FindAllEmailTemplateDto): Promise<EmailTemplate[]> {
    const qb = this.emailTemplateRepository
      .createQueryBuilder('email_templates')
      .select('email_templates.*');

    const builder = this.makeSearchable(
      this.makeFilter(buildFindAllQueryBuilder(qb, options), options),
      options,
    );

    return await builder.execute();
  }

  async findAllCount(options: FindAllEmailTemplateDto): Promise<number> {
    const qb = this.emailTemplateRepository.createQueryBuilder(
      'email_templates',
    );

    const builder = this.makeSearchable(
      this.makeFilter(buildFindAllQueryBuilder(qb, options), options),
      options,
    );

    return await builder.getCount();
  }

  async findOne(options: FindOneEmailTemplateDto): Promise<EmailTemplate> {
    const data = await this.findAll(options);

    return _.head(data);
  }

  @Transactional()
  async create(
    createEmailTemplateDto: CreateEmailTemplateDto,
  ): Promise<EmailTemplate> {
    const {
      id,
      organization_id,
      name,
      design,
      html,
      example_value_tags,
      image_url,
      actor_id: created_by,
    } = createEmailTemplateDto;

    const emailTemplate = await this.emailTemplateRepository.save(
      this.emailTemplateRepository.create({
        id,
        organization_id,
        name,
        design,
        html,
        example_value_tags,
        image_url,
        created_by,
        updated_by: created_by,
      }),
    );

    return this.findOne({
      id: emailTemplate.id,
      organization_id,
    });
  }

  @Transactional()
  async update(
    updateEmailTemplateDto: UpdateEmailTemplateDto,
  ): Promise<EmailTemplate> {
    const {
      id,
      organization_id,
      name,
      design,
      html,
      example_value_tags,
      image_url,
      actor_id: updated_by,
    } = updateEmailTemplateDto;

    const emailTemplate = await this.findOne({ id, organization_id });
    if (!emailTemplate) {
      throw new RpcException(`Could not find resource ${id}.`);
    }

    Object.assign(emailTemplate, {
      organization_id,
      name,
      design,
      html,
      example_value_tags,
      image_url,
      actor_id: updated_by,
    });

    await this.emailTemplateRepository.save(emailTemplate);

    return this.findOne({
      id: emailTemplate.id,
      organization_id,
    });
  }

  @Transactional()
  async remove(
    deleteEmailTemplateDto: DeleteEmailTemplateDto,
  ): Promise<number> {
    const {
      id,
      ids,
      is_hard,
      organization_id,
      actor_id: deleted_by,
    } = deleteEmailTemplateDto;

    const toBeDeleteIds = ids === undefined ? [] : ids;
    if (id !== undefined) {
      toBeDeleteIds.push(id);
    }

    const emailTemplates = await this.emailTemplateRepository.find({
      where: {
        id: In(toBeDeleteIds),
        organization_id,
      },
    });

    if (is_hard) {
      await this.emailTemplateRepository.remove(emailTemplates);
    } else {
      await this.emailTemplateRepository.save(
        emailTemplates.map((emailTemplate) => {
          Object.assign(emailTemplate, {
            deleted_by,
            deleted_at: new Date().toISOString(),
          });

          return emailTemplate;
        }),
      );
    }

    return emailTemplates.length;
  }

  protected makeFilter(
    builder: SelectQueryBuilder<EmailTemplate>,
    options: FindOneEmailTemplateDto | FindAllEmailTemplateDto,
  ): SelectQueryBuilder<EmailTemplate> {
    const { organization_id: organizationId } = options;

    builder.andWhere(
      new Brackets((qb) => {
        qb.where('email_templates.organization_id = :organizationId', {
          organizationId,
        }).orWhere('email_templates.organization_id IS NULL');
      }),
    );

    return builder;
  }

  protected makeSearchable(
    builder: SelectQueryBuilder<EmailTemplate>,
    { search }: FindAllEmailTemplateDto,
  ): SelectQueryBuilder<EmailTemplate> {
    if (search) {
      const params = { search: `%${search}%` };
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('email_templates.name LIKE :search', params);
        }),
      );
    }

    return builder;
  }
}
