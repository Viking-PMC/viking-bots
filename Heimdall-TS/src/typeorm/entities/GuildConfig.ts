import { Column, Entity, ObjectIdColumn } from 'typeorm';

@Entity({ name: 'guild_configs' })
export class GuildConfig {
  @ObjectIdColumn()
  id: number;

  @Column({ unique: true })
  guildId: string;

  @Column()
  logChannelId: string;

}
