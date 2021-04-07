import { IsNotEmpty, IsUUID } from 'class-validator';
import { DeleteDto, FindAllDto, FindOneDto } from './';

export class OrganizationDto {
  @IsNotEmpty()
  @IsUUID('4')
  organization_id: string;
}

export class FindAllWithOrganizationDto extends FindAllDto {
  @IsNotEmpty()
  @IsUUID('4')
  organization_id: string;
}

export class FindOneWithOrganizationDto extends FindOneDto {
  @IsNotEmpty()
  @IsUUID('4')
  organization_id: string;
}

export class DeleteWithOrganizationDto extends DeleteDto {
  @IsNotEmpty()
  @IsUUID('4')
  organization_id: string;
}
