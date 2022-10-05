import { Column, Entity, ObjectIdColumn } from 'typeorm';

@Entity({ name: 'application_configs' })
export class ApplicationConfig {
  @ObjectIdColumn()
  id: number;

  @Column({ unique: true })
  guildId: string;

  @Column()
  enabled: boolean;

  @Column()
  messageId: string;

  @Column()
  channelId: string;

  @Column()
  categoryId: string;

  @Column({ default: '405409164660047872' })
  role: string;
}
