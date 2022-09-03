import { Column, Entity, ManyToOne, ObjectIdColumn } from 'typeorm';
import { Application } from './Application';

@Entity({ name: 'application_messages' })
export class ApplicationMessage {
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

  @ManyToOne(() => Application, (application) => application.messages)
  application: Application;
}
