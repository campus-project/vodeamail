import { Body, Controller, HttpCode, Inject, Post } from '@nestjs/common';
import { VodeaCloudService } from '../../domain/services/vodea-cloud.service';
import { VodeaCloudSignInDto } from '../dtos/vodea-cloud.dto';
import { GenerateAccessTokenFromRefreshTokenDto } from '../dtos/auth.dto';
import { JwtService } from '../../domain/services/jwt.service';
import { Public } from 'vnest-core';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('VODEA_CLOUD_SERVICE')
    private readonly vodeaCloudService: VodeaCloudService,
    @Inject('JWT_SERVICE')
    private readonly jwtService: JwtService,
  ) {}

  @Public()
  @Post('vodea-cloud')
  @HttpCode(200)
  vodeaCloudSignIn(@Body() body: VodeaCloudSignInDto) {
    return this.vodeaCloudService.signIn(body);
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(200)
  refreshToken(@Body() body: GenerateAccessTokenFromRefreshTokenDto) {
    return this.jwtService.createAccessTokenFromRefreshToken(body);
  }
}
