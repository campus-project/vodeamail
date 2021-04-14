import { Injectable } from '@nestjs/common';
import { Brackets, In, IsNull, Like, Repository } from 'typeorm';
import { EmailTemplate } from '../entities/email-template.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { buildFindAllQueryOption, buildFindOneQueryOption } from 'vnest-core';
import {
  CreateEmailTemplateDto,
  DeleteEmailTemplateDto,
  FindAllEmailTemplateDto,
  FindOneEmailTemplateDto,
  UpdateEmailTemplateDto,
} from '../../application/dtos/email-template.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class EmailTemplateService {
  constructor(
    @InjectRepository(EmailTemplate)
    private readonly emailTemplateRepository: Repository<EmailTemplate>,
  ) {}

  async findAll(options: FindAllEmailTemplateDto): Promise<EmailTemplate[]> {
    const { search } = options;
    const queryBuilder = this.buildFindQuery(
      buildFindAllQueryOption({ options }),
      options,
    );

    if (search) {
      const whereClause = queryBuilder.where;
      queryBuilder.where = new Brackets((qb) => {
        Object.keys(whereClause).forEach((key, index) => {
          qb.where({ [key]: whereClause[key] });
        });

        qb.where(
          new Brackets((qb1) => {
            qb1.where('`name` LIKE ' + `"%${search}%"`);
          }),
        );
      });
    }

    return await this.emailTemplateRepository.find(queryBuilder);
  }

  async findAllCount(options: FindAllEmailTemplateDto): Promise<number> {
    const { search, with_deleted: withDeleted } = options;
    const { where, cache, take, skip } = this.buildFindQuery(
      buildFindAllQueryOption({ options }),
      options,
    );

    const builder = await this.emailTemplateRepository
      .createQueryBuilder('email_templates')
      .where(where)
      .cache(cache)
      .take(take)
      .skip(skip);

    if (withDeleted) {
      builder.withDeleted();
    }

    if (search) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('`email_templates`.`name` LIKE ' + `"%${search}%"`);
        }),
      );
    }

    return builder.getCount();
  }

  async findAllBuilder(
    options: FindAllEmailTemplateDto,
  ): Promise<EmailTemplate[]> {
    const { search, with_deleted: withDeleted } = options;
    const { where, cache, order, take, skip } = this.buildFindQuery(
      buildFindAllQueryOption({ options }),
      options,
    );

    const builder = await this.emailTemplateRepository
      .createQueryBuilder('email_templates')
      .select('email_templates.*')
      .where(where)
      .cache(cache)
      .orderBy(order)
      .take(take)
      .skip(skip);

    if (withDeleted) {
      builder.withDeleted();
    }

    if (search) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('`email_templates`.`name` LIKE ' + `"%${search}%"`);
        }),
      );
    }

    return builder.execute();
  }

  async findOne(options: FindOneEmailTemplateDto): Promise<EmailTemplate> {
    const queryBuilder = this.buildFindQuery(
      buildFindOneQueryOption({ options }),
      options,
    );

    return await this.emailTemplateRepository.findOne(queryBuilder);
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

  protected buildFindQuery(
    queryBuilder,
    options: FindOneEmailTemplateDto | FindAllEmailTemplateDto,
  ) {
    Object.assign(queryBuilder.where, {
      organization_id: options.organization_id || IsNull(),
    });

    return queryBuilder;
  }
}
