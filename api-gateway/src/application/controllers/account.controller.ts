import { Controller, Get, Inject, Post } from '@nestjs/common';
import { User } from '../../@vodea/decorators/user.decorator';
import { RefreshTokenService } from '../../domain/services/refresh-token.service';

@Controller('account')
export class AccountController {
  constructor(
    @Inject('AUTH_REFRESH_TOKEN_SERVICE')
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  @Get()
  account(@User() user) {
    return { data: user };
  }

  @Post('logout')
  async logout(@User('id') userId) {
    const data = await this.refreshTokenService.revoke({
      user_id: userId,
    });

    return { data };
  }
}
