import { Column, Entity, ObjectIdColumn } from 'typeorm';

@Entity({ name: 'ranks' })
export class Rank {
  @ObjectIdColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  value: number;
}
