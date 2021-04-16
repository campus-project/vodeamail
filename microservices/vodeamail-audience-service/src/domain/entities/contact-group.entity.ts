import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Group } from './group.entity';
import { Contact } from './contact.entity';

@Entity('contact_groups')
export class ContactGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  contact_id: string;

  @Column({ type: 'uuid' })
  group_id: string;

  @ManyToOne(() => Group, (object) => object.contact_groups)
  group: Group;

  @ManyToOne(() => Contact, (object) => object.contact_groups)
  contact: Contact;
}
