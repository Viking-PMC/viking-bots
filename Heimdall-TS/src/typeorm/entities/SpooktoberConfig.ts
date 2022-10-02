import { Column, Entity, ObjectIdColumn } from 'typeorm';

@Entity({ name: 'spooktober_configs' })
export class SpooktoberConfig {
  @ObjectIdColumn()
  id: number;

  @Column({ unique: true })
  guildId: string;

  @Column()
  enabled: boolean;

  @Column()
  blacklist: string[];
}
