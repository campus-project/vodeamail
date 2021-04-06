import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { EmailTemplate } from '../entities/email-template.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import {
  buildFindAllQueryOption,
  buildFindOneQueryOption,
} from '../../@vodea/typeorm';
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
    const queryBuilder = buildFindAllQueryOption({ options });

    if (options.organization_id !== undefined) {
      Object.assign(queryBuilder.where, {
        organization_id: options.organization_id,
      });
    }

    return await this.emailTemplateRepository.find(queryBuilder);
  }

  async findOne(options: FindOneEmailTemplateDto): Promise<EmailTemplate> {
    const queryBuilder = buildFindOneQueryOption({ options });

    if (options.organization_id !== undefined) {
      Object.assign(queryBuilder.where, {
        organization_id: options.organization_id,
      });
    }

    return await this.emailTemplateRepository.findOne(queryBuilder);
  }

  @Transactional()
  async create(
    createEmailTemplateDto: CreateEmailTemplateDto,
  ): Promise<EmailTemplate> {
    const { id, organization_id, name } = createEmailTemplateDto;

    const emailTemplate = await this.emailTemplateRepository.save(
      this.emailTemplateRepository.create({
        id,
        organization_id,
        name,
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
    const { id, organization_id, name } = updateEmailTemplateDto;

    const contact = await this.findOne({ id, organization_id });
    if (!contact) {
      throw new RpcException(`Could not find resource ${id}.`);
    }

    Object.assign(contact, {
      organization_id,
      name,
    });

    await this.emailTemplateRepository.save(contact);

    return this.findOne({
      id: contact.id,
      organization_id,
    });
  }

  @Transactional()
  async remove(
    deleteEmailTemplateDto: DeleteEmailTemplateDto,
  ): Promise<number> {
    const { id, ids, is_hard, organization_id } = deleteEmailTemplateDto;

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
      await this.emailTemplateRepository.softRemove(emailTemplates);
    }

    return emailTemplates.length;
  }
}
