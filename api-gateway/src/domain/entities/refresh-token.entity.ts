import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column({ type: 'tinyint', default: 0 })
  is_revoked: boolean;

  @Column({ type: 'datetime' })
  expires_at: string;
}
