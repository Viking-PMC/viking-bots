import { Column, Entity, ObjectIdColumn } from 'typeorm';

@Entity({ name: 'ticket_configs' })
export class TicketConfig {
  @ObjectIdColumn()
  id: number;

  @Column({ unique: true })
  guildId: string;

  @Column()
  messageId: string;

  @Column()
  channelId: string;

  @Column()
  categoryId: string;

  @Column({ default: '405409164660047872' })
  role: string;
}
