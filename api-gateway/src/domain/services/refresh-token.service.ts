import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import {
  CreateRefreshTokenDto,
  FindOneRefreshTokenDto,
  RevokeRefreshTokenDto,
} from '../../application/dtos/refresh-token.dto';
import * as moment from 'moment';
import { buildFindOneQueryOption, DeleteDto } from 'vnest-core';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async findOne(options: FindOneRefreshTokenDto): Promise<RefreshToken> {
    return await this.refreshTokenRepository.findOne(
      buildFindOneQueryOption({ options }),
    );
  }

  @Transactional()
  async create(
    createRefreshTokenDto: CreateRefreshTokenDto,
  ): Promise<RefreshToken> {
    const { user_id, ttl } = createRefreshTokenDto;

    const refreshToken = await this.refreshTokenRepository.save(
      this.refreshTokenRepository.create({
        user_id,
        expires_at: moment().add(ttl, 'seconds').format(),
        is_revoked: false,
      }),
    );

    return this.findOne({ id: refreshToken.id });
  }

  @Transactional()
  async remove(deleteRefreshTokenDto: DeleteDto): Promise<number> {
    const { id, ids, is_hard } = deleteRefreshTokenDto;

    const toBeDeleteIds = ids === undefined ? [] : ids;
    if (id !== undefined) {
      toBeDeleteIds.push(id);
    }

    const roles = await this.refreshTokenRepository.find({
      where: {
        id: In(toBeDeleteIds),
      },
    });

    if (is_hard) {
      await this.refreshTokenRepository.remove(roles);
    } else {
      await this.refreshTokenRepository.softRemove(roles);
    }

    return roles.length;
  }

  @Transactional()
  async revoke(revokeRefreshTokenDto: RevokeRefreshTokenDto): Promise<boolean> {
    const { id, user_id } = revokeRefreshTokenDto;

    if (id) {
      const refreshToken = await this.refreshTokenRepository.findOne(id);
      if (refreshToken) {
        await this.refreshTokenRepository.save(
          Object.assign(refreshToken, {
            is_revoked: true,
          }),
        );
      }
    }

    if (user_id) {
      const refreshTokens = await this.refreshTokenRepository.find({
        where: { user_id, is_revoked: 0 },
      });

      for (const refreshToken of refreshTokens) {
        Object.assign(refreshToken, {
          is_revoked: true,
        });

        await this.refreshTokenRepository.save(refreshToken);
      }
    }

    return true;
  }
}
