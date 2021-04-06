import { IsOptional, IsUUID } from 'class-validator';
import { DeleteWithOrganizationDto, OrganizationDto } from './organization.dto';

export class ActorDto {
  @IsOptional()
  @IsUUID('4')
  actor_id?: string;
}

export class ActorOrganizationDto extends OrganizationDto {
  @IsOptional()
  @IsUUID('4')
  actor_id?: string;
}

export class ActorDeleteWithOrganizationDto extends DeleteWithOrganizationDto {
  @IsOptional()
  @IsUUID('4')
  actor_id?: string;
}
