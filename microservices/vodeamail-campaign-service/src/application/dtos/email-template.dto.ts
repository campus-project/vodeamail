import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import {
  FindAllWithOrganizationDto,
  FindOneWithOrganizationDto,
} from '../../@vodea/dtos';
import {
  ActorDeleteWithOrganizationDto,
  ActorOrganizationDto,
} from '../../@vodea/dtos/actor.dto';

export class FindAllEmailTemplateDto extends FindAllWithOrganizationDto {}

export class FindOneEmailTemplateDto extends FindOneWithOrganizationDto {}

export class CreateEmailTemplateDto extends ActorOrganizationDto {
  @IsOptional()
  @IsUUID('4')
  id?: string;

  @IsNotEmpty()
  @IsString()
  name: string;
}

export class UpdateEmailTemplateDto extends CreateEmailTemplateDto {
  @IsNotEmpty()
  @IsUUID('4')
  id: string;
}

export class DeleteEmailTemplateDto extends ActorDeleteWithOrganizationDto {}
