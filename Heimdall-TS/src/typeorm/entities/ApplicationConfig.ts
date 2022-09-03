import { Column, Entity, ObjectIdColumn } from 'typeorm';

@Entity({ name: 'application_configs' })
export class ApplicationConfig {
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
}
