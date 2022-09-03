import { Column, Entity, ObjectIdColumn, OneToMany } from 'typeorm';
import { TicketStatus } from '../../utils/Types';
import { TicketMessage } from './TicketMessage';

@Entity({ name: 'tickets' })
export class Ticket {
  @ObjectIdColumn()
  id: number;

  @Column({ nullable: true })
  messageId: string;

  @Column({ nullable: true })
  channelId: string;

  @Column()
  createdBy: string;

  @Column({ default: 'created' })
  status: TicketStatus;

  @OneToMany(() => TicketMessage, (m) => m.ticket)
  messages: TicketMessage[];
}
