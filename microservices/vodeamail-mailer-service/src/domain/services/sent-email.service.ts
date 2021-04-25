import { Inject, Injectable } from '@nestjs/common';
import { Brackets, In, Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { buildFindAllQueryBuilder } from 'vnest-core';
import * as _ from 'lodash';
import * as moment from 'moment';

import {
  CreateSentEmailDto,
  FindAllSentEmailDto,
  FindOneSentEmailDto,
} from '../../application/dtos/sent-email.dto';
import { SentEmail } from '../entities/sent-email.entity';
import { SentEmailClick } from '../entities/sent-email-click.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class SentEmailService {
  @Inject('REDIS_TRANSPORT')
  private readonly redisClient: ClientProxy;

  //entity
  @InjectRepository(SentEmail)
  private readonly sentEmailRepository: Repository<SentEmail>;

  @InjectRepository(SentEmailClick)
  private readonly sentEmailClickRepository: Repository<SentEmailClick>;

  constructor(private readonly mailerService: MailerService) {}

  async findAll(options: FindAllSentEmailDto): Promise<SentEmail[]> {
    const { relations } = options;
    const qb = this.sentEmailRepository
      .createQueryBuilder('sent_emails')
      .select('sent_emails.*');

    const builder = this.makeSearchable(
      this.makeFilter(buildFindAllQueryBuilder(qb, options), options),
      options,
    );

    let data = await builder.execute();

    //relations
    if (relations !== undefined && relations.length) {
      const sentEmailIds = [];

      const relationValues = {
        sentEmailClicks: undefined,
      };

      data.forEach((group) => {
        sentEmailIds.push(group.id);
      });

      //groups
      if (relations.indexOf('sent_email_clicks') !== -1) {
        relationValues.sentEmailClicks = await this.sentEmailClickRepository.find(
          {
            where: { sent_email_id: In([...new Set(sentEmailIds)]) },
          },
        );
      }

      data = data.map((sentEmail) => {
        if (relationValues.sentEmailClicks !== undefined) {
          sentEmail.sent_email_clicks = relationValues.sentEmailClicks.filter(
            (sentEmailClick) => sentEmailClick.sent_email_id === sentEmail.id,
          );
        }

        return sentEmail;
      });
    }

    return data;
  }

  async findAllCount(options: FindAllSentEmailDto): Promise<number> {
    const qb = this.sentEmailRepository.createQueryBuilder('sent_emails');
    const builder = this.makeSearchable(
      this.makeFilter(buildFindAllQueryBuilder(qb, options), options),
      options,
    );

    return await builder.getCount();
  }

  async findOne(options: FindOneSentEmailDto): Promise<SentEmail> {
    const data = await this.findAll(options);

    return _.head(data);
  }

  @Transactional()
  async create(createSentEmailDto: CreateSentEmailDto): Promise<SentEmail> {
    const {
      id,
      organization_id,
      subject,
      from,
      email_from,
      to,
      email_to,
      content,
      subject_id: subjectId,
      callback_accepted_message: callbackAcceptedMessage,
      callback_delivered_message: callbackDeliveredMessage,
      callback_failed_message: callbackFailedMessage,
    } = createSentEmailDto;

    if (subjectId && callbackAcceptedMessage) {
      await this.redisClient
        .emit(callbackAcceptedMessage, {
          id: subjectId,
          timestamp: moment().format(),
        })
        .toPromise();
    }

    const hash = await this.generateHash();
    const headers = {
      'X-Mailer-Hash': hash,
    };

    let sentEmail = null;

    this.mailerService
      .sendMail({
        from: from ? `${from} <${email_from}>` : email_from,
        to: to ? `${to} <${email_to}>` : email_to,
        subject: subject,
        html: content,
        headers,
      })
      .then(async () => {
        sentEmail = await this.sentEmailRepository.save(
          this.sentEmailRepository.create({
            id,
            organization_id,
            hash,
            subject,
            from,
            email_from,
            to,
            email_to,
            content,
            headers: JSON.stringify(headers),
          }),
        );

        if (subjectId && callbackDeliveredMessage) {
          await this.redisClient
            .emit(callbackDeliveredMessage, {
              id: subjectId,
              timestamp: moment().format(),
            })
            .toPromise();
        }
      })
      .catch(async (e) => {
        if (subjectId && callbackFailedMessage) {
          await this.redisClient
            .emit(callbackFailedMessage, {
              id: subjectId,
              timestamp: moment().format(),
              failed_message: JSON.stringify(e),
            })
            .toPromise();
        }
      });

    if (!sentEmail) {
      return null;
    }

    return this.findOne({
      id: sentEmail.id,
      organization_id,
    });
  }

  protected makeFilter(
    builder: SelectQueryBuilder<SentEmail>,
    options: FindOneSentEmailDto | FindAllSentEmailDto,
  ): SelectQueryBuilder<SentEmail> {
    const { organization_id: organizationId } = options;

    builder.andWhere(
      new Brackets((qb) => {
        qb.where('sent_emails.organization_id = :organizationId', {
          organizationId,
        }).orWhere('sent_emails.organization_id IS NULL');
      }),
    );

    return builder;
  }

  protected makeSearchable(
    builder: SelectQueryBuilder<SentEmail>,
    { search }: FindAllSentEmailDto,
  ): SelectQueryBuilder<SentEmail> {
    if (search) {
      const params = { search: `%${search}%` };
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('sent_emails.from LIKE :search', params)
            .orWhere('sent_emails.from_email LIKE :search', params)
            .orWhere('sent_emails.to LIKE :search', params)
            .orWhere('sent_emails.to_email LIKE :search', params);
        }),
      );
    }

    return builder;
  }

  protected async generateHash(): Promise<string> {
    const hash = this.makeHash(32);

    const isExists =
      (await this.sentEmailRepository.count({
        where: {
          hash,
        },
      })) > 0;

    if (isExists) {
      return await this.generateHash();
    }

    return hash;
  }

  protected makeHash(length): string {
    let result = [];
    let characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result.push(
        characters.charAt(Math.floor(Math.random() * charactersLength)),
      );
    }

    return result.join('');
  }
}
