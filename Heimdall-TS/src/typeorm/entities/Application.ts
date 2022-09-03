import { Column, Entity, ObjectIdColumn, OneToMany } from 'typeorm';
import { ApplicationStatus } from '../../utils/Types';
import { ApplicationMessage } from './ApplicationMessage';

@Entity({ name: 'applications' })
export class Application {
  @ObjectIdColumn()
  id: number;

  @Column({ nullable: true })
  messageId: string;

  @Column({ nullable: true })
  channelId: string;

  @Column()
  createdBy: string;

  @Column({ default: 'opened' })
  status: ApplicationStatus;

  @OneToMany(() => ApplicationMessage, (m) => m.application)
  messages: ApplicationMessage[];
}
