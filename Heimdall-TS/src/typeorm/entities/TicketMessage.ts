import { Column, Entity, ManyToOne, ObjectIdColumn } from 'typeorm';
import { Ticket } from './Ticket';

@Entity({ name: 'ticket_messages' })
export class TicketMessage {
  @ObjectIdColumn()
  id: number;

  @Column({ default: '' })
  content: string;

  @Column({ nullable: true })
  createdAt: Date;

  @Column({ nullable: true })
  authorTag: string;

  @Column({ nullable: true })
  authorId: string;

  @Column({ nullable: true })
  authorAvatar: string;

  @ManyToOne(() => Ticket, (ticket) => ticket.messages)
  ticket: Ticket;
}
